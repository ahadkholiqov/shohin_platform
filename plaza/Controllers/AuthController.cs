using Microsoft.AspNetCore.Mvc;
using plaza.DTOs;

namespace plaza.Controllers
{
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;

        public AuthController(IWebHostEnvironment env) => _env = env;

        [HttpPost("/api/admin/login")]
        public IActionResult Login(AdminLoginDto dto)
        {
            var expected = Environment.GetEnvironmentVariable("ADMIN_TOKEN");
            if (string.IsNullOrEmpty(expected))
                return StatusCode(StatusCodes.Status500InternalServerError, "Admin token is not configured.");

            if (dto.Token != expected)
                return Unauthorized("Invalid admin token.");

            return Ok(new { success = true });
        }

        [HttpPost("/api/admin/upload")]
        [RequestSizeLimit(20 * 1024 * 1024)]
        public async Task<ActionResult<UploadResultDto>> Upload(IFormFile file)
        {
            if (file is null || file.Length == 0)
                return BadRequest("No file provided.");

            var allowed = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowed.Contains(ext))
                return BadRequest("Unsupported file type. Allowed: jpg, jpeg, png, webp, gif.");

            var uploadsDir = Path.Combine(_env.ContentRootPath, "LocalUploads");
            Directory.CreateDirectory(uploadsDir);

            var fileName = $"{Guid.NewGuid():N}{ext}";
            var fullPath = Path.Combine(uploadsDir, fileName);

            await using (var stream = System.IO.File.Create(fullPath))
            {
                await file.CopyToAsync(stream);
            }

            var url = $"/uploads/{fileName}";
            return Ok(new UploadResultDto(url));
        }
    }
}
