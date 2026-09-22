using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace plaza.Middleware
{
    public class DbExceptionHandler : IExceptionHandler
    {
        public async ValueTask<bool> TryHandleAsync(
            HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
        {
            if (exception is DbUpdateException
                {
                    InnerException: PostgresException { SqlState: PostgresErrorCodes.UniqueViolation }
                })
            {
                httpContext.Response.StatusCode = StatusCodes.Status409Conflict;
                await httpContext.Response.WriteAsJsonAsync(
                    new { error = "A record with the same unique value already exists." },
                    cancellationToken);
                return true;
            }

            return false;
        }
    }
}
