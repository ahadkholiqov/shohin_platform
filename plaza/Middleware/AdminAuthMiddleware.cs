namespace plaza.Middleware
{
    public class AdminAuthMiddleware
    {
        public const string HeaderName = "X-Admin-Token";

        private readonly RequestDelegate _next;

        public AdminAuthMiddleware(RequestDelegate next) => _next = next;

        public async Task InvokeAsync(HttpContext context)
        {
            var path = context.Request.Path;

            var requiresAuth = path.StartsWithSegments("/api/admin")
                && !path.StartsWithSegments("/api/admin/login");

            if (requiresAuth)
            {
                var expected = Environment.GetEnvironmentVariable("ADMIN_TOKEN");
                if (string.IsNullOrEmpty(expected))
                {
                    context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                    await context.Response.WriteAsJsonAsync(
                        new { error = "Admin token is not configured on the server." });
                    return;
                }

                var provided = context.Request.Headers[HeaderName].ToString();
                if (string.IsNullOrEmpty(provided) || provided != expected)
                {
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    await context.Response.WriteAsJsonAsync(
                        new { error = "Invalid or missing admin token." });
                    return;
                }
            }

            await _next(context);
        }
    }
}
