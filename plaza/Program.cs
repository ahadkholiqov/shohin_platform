using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using plaza.Data;
using plaza.Middleware;

namespace plaza
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Load .env from the solution/workspace root (one level above the project).
            var envPath = Path.Combine(builder.Environment.ContentRootPath, "..", ".env");
            DotNetEnv.Env.Load(envPath);

            var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL")
                ?? throw new InvalidOperationException("DATABASE_URL is not set in the .env file.");

            var connectionString = BuildNpgsqlConnectionString(databaseUrl);

            // Add services to the container.
            builder.Services.AddControllers()
                .AddJsonOptions(options =>
                {
                    // Serialize enums as their string names ("Available"), not integers.
                    options.JsonSerializerOptions.Converters.Add(
                        new System.Text.Json.Serialization.JsonStringEnumConverter());
                });
            builder.Services.AddOpenApi();

            // Map known DB exceptions (e.g. unique violations) to clean HTTP responses.
            builder.Services.AddExceptionHandler<DbExceptionHandler>();
            builder.Services.AddProblemDetails();

            builder.Services.AddDbContext<AppDbContext>(options =>
                options.UseNpgsql(connectionString));

            // CORS only for the local Vite dev server (frontend on another origin).
            // In production the SPA is served same-origin by this app, so CORS is bypassed.
            const string DevCorsPolicy = "DevCors";
            builder.Services.AddCors(options =>
            {
                options.AddPolicy(DevCorsPolicy, policy =>
                    policy.WithOrigins("http://localhost:5173")
                          .AllowAnyMethod()
                          .AllowAnyHeader());
            });

            builder.Services.AddRateLimiter(options =>
            {
                options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

                // Brute-force protection for the WHOLE admin surface (H2).
                // A request carrying the valid admin token is never limited, so the
                // single admin can work freely. Every unauthenticated /api/admin/*
                // request — login attempts and token guesses against ANY admin route —
                // is capped at 5 / 5 min per IP. This closes the "guess the token on a
                // non-login endpoint" bypass and auto-covers future admin routes.
                options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
                {
                    if (!httpContext.Request.Path.StartsWithSegments("/api/admin"))
                        return RateLimitPartition.GetNoLimiter("public");

                    var expected = Environment.GetEnvironmentVariable("ADMIN_TOKEN");
                    var provided = httpContext.Request.Headers[AdminAuthMiddleware.HeaderName].ToString();
                    if (!string.IsNullOrEmpty(expected) && provided == expected)
                        return RateLimitPartition.GetNoLimiter("admin-authenticated");

                    var ip = httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
                    return RateLimitPartition.GetFixedWindowLimiter($"admin-guess:{ip}",
                        _ => new FixedWindowRateLimiterOptions
                        {
                            PermitLimit = 5,
                            Window = TimeSpan.FromMinutes(5),
                            QueueLimit = 0,
                        });
                });

                // Anti-spam for the public lead form (M1): 5 submissions / min per IP.
                options.AddPolicy("public-submit-limit", httpContext =>
                    RateLimitPartition.GetFixedWindowLimiter(
                        partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                        factory: _ => new FixedWindowRateLimiterOptions
                        {
                            PermitLimit = 5,
                            Window = TimeSpan.FromMinutes(1),
                            QueueLimit = 0,
                        }));
            });

            var app = builder.Build();

            // Apply any pending EF Core migrations on startup.
            using (var scope = app.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                db.Database.Migrate();
            }

            // Configure the HTTP request pipeline.
            app.UseExceptionHandler();

            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
            }

            app.UseHttpsRedirection();

            // Serve the compiled SPA and other static assets from wwwroot.
            app.UseStaticFiles();

            // Serve admin-uploaded images from plaza/LocalUploads at /uploads.
            // Kept outside wwwroot so frontend builds (emptyOutDir) never wipe them.
            var uploadsPath = Path.Combine(builder.Environment.ContentRootPath, "LocalUploads");
            Directory.CreateDirectory(uploadsPath);
            app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider = new PhysicalFileProvider(uploadsPath),
                RequestPath = "/uploads",
            });

            // CORS first so preflight requests are handled before the admin guard.
            app.UseCors(DevCorsPolicy);
            app.UseRateLimiter();
            app.UseMiddleware<AdminAuthMiddleware>();
            app.UseAuthorization();
            app.MapControllers();

            // Serve the SPA's index.html for any non-API, non-file route so client-side
            // routing (e.g. /admin, /catalog) works on a hard refresh. Placed AFTER
            // MapControllers so it never swallows real API 404s.
            app.MapFallbackToFile("index.html");

            app.Run();
        }

        // Converts a postgres://user:pass@host:port/dbname URL into an Npgsql connection string.
        private static string BuildNpgsqlConnectionString(string databaseUrl)
        {
            var uri = new Uri(databaseUrl);
            var userInfo = uri.UserInfo.Split(':', 2);

            var username = Uri.UnescapeDataString(userInfo[0]);
            var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : string.Empty;
            var database = uri.AbsolutePath.TrimStart('/');
            var port = uri.Port > 0 ? uri.Port : 5432;

            return new Npgsql.NpgsqlConnectionStringBuilder
            {
                Host = uri.Host,
                Port = port,
                Username = username,
                Password = password,
                Database = database
            }.ConnectionString;
        }
    }
}
