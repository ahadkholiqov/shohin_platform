namespace plaza.Middleware
{
    // Fail-safe admin guard: every /api/admin/* route requires the X-Admin-Token
    // header to match ADMIN_TOKEN, with /api/admin/login as the only exception.
    // Protection is by path prefix, so new admin routes are covered automatically.
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
