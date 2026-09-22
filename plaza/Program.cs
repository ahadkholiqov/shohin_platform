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

            var envPath = Path.Combine(builder.Environment.ContentRootPath, "..", ".env");
            DotNetEnv.Env.Load(envPath);

            var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL")
                ?? throw new InvalidOperationException("DATABASE_URL is not set in the .env file.");

            var connectionString = BuildNpgsqlConnectionString(databaseUrl);

            builder.Services.AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.Converters.Add(
                        new System.Text.Json.Serialization.JsonStringEnumConverter());
                });
            builder.Services.AddOpenApi();

            builder.Services.AddExceptionHandler<DbExceptionHandler>();
            builder.Services.AddProblemDetails();

            builder.Services.AddDbContext<AppDbContext>(options =>
                options.UseNpgsql(connectionString));

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

            using (var scope = app.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                db.Database.Migrate();
            }

            app.UseExceptionHandler();

            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
            }

            app.UseHttpsRedirection();

            app.UseStaticFiles();

            var uploadsPath = Path.Combine(builder.Environment.ContentRootPath, "LocalUploads");
            Directory.CreateDirectory(uploadsPath);
            app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider = new PhysicalFileProvider(uploadsPath),
                RequestPath = "/uploads",
            });

            app.UseCors(DevCorsPolicy);
            app.UseRateLimiter();
            app.UseMiddleware<AdminAuthMiddleware>();
            app.UseAuthorization();
            app.MapControllers();

            app.MapFallbackToFile("index.html");

            app.Run();
        }

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
