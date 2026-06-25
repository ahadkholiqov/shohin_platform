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

            // Permissive CORS for the development phase (React frontend on another origin).
            const string DevCorsPolicy = "DevCors";
            builder.Services.AddCors(options =>
            {
                options.AddPolicy(DevCorsPolicy, policy =>
                    policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
            });

            var app = builder.Build();

            // Ensure the database and tables physically exist (MVP setup, no migrations yet).
            using (var scope = app.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                db.Database.EnsureCreated();
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
            app.UseMiddleware<AdminAuthMiddleware>();
            app.UseAuthorization();
            app.MapControllers();

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
