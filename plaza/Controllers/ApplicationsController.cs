using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using plaza.Data;
using plaza.DTOs;
using plaza.Models;

namespace plaza.Controllers
{
    [ApiController]
    public class ApplicationsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public ApplicationsController(AppDbContext db) => _db = db;

        [HttpPost("/api/applications")]
        [EnableRateLimiting("public-submit-limit")]
        public async Task<IActionResult> Submit(ApplicationCreateDto dto)
        {
            if (dto.ApartmentId.HasValue &&
                !await _db.Apartments.AnyAsync(a => a.Id == dto.ApartmentId.Value))
            {
                return BadRequest("Referenced apartment does not exist.");
            }

            var application = new Application
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Phone = dto.Phone,
                Comment = dto.Comment,
                ApartmentId = dto.ApartmentId,
                CreatedAt = DateTimeOffset.UtcNow,
                Status = ApplicationStatus.New
            };

            _db.Applications.Add(application);
            await _db.SaveChangesAsync();

            return Ok(new { application.Id });
        }

        [HttpGet("/api/admin/applications")]
        public async Task<ActionResult<List<ApplicationListItemDto>>> GetAll(
            [FromQuery] ApplicationStatus? status)
        {
            var query = _db.Applications.AsNoTracking().AsQueryable();
            if (status.HasValue) query = query.Where(a => a.Status == status.Value);

            var items = await query
                .OrderByDescending(a => a.CreatedAt)
                .Select(a => new ApplicationListItemDto(
                    a.Id, a.Name, a.Phone, a.Comment,
                    a.ApartmentId,
                    a.Apartment != null ? a.Apartment.Number : null,
                    a.Apartment != null ? a.Apartment.Block : null,
                    a.CreatedAt, a.Status))
                .ToListAsync();

            return Ok(items);
        }

        [HttpPut("/api/admin/applications/{id:guid}/status")]
        public async Task<IActionResult> UpdateStatus(Guid id, ApplicationStatusUpdateDto dto)
        {
            var application = await _db.Applications.FirstOrDefaultAsync(a => a.Id == id);
            if (application is null) return NotFound();

            application.Status = dto.Status;
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
