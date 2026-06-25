using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using plaza.Data;
using plaza.DTOs;
using plaza.Models;

namespace plaza.Controllers
{
    [ApiController]
    public class SettingsController : ControllerBase
    {
        private const int SettingsId = 1;

        private readonly AppDbContext _db;

        public SettingsController(AppDbContext db) => _db = db;

        [HttpGet("/api/settings")]
        public async Task<ActionResult<SettingsDto>> Get()
        {
            var s = await _db.PlatformSettings.AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == SettingsId);

            if (s is null) return NotFound("Platform settings have not been configured yet.");

            return Ok(new SettingsDto(
                s.HeroTitle, s.ConstructionProgressDescription,
                s.ContactPhone, s.WhatsAppLink, s.TelegramLink));
        }

        // Upserts the single settings row (Id = 1).
        [HttpPut("/api/admin/settings")]
        public async Task<IActionResult> Update(SettingsUpdateDto dto)
        {
            var s = await _db.PlatformSettings.FirstOrDefaultAsync(p => p.Id == SettingsId);

            if (s is null)
            {
                s = new PlatformSetting { Id = SettingsId };
                _db.PlatformSettings.Add(s);
            }

            s.HeroTitle = dto.HeroTitle;
            s.ConstructionProgressDescription = dto.ConstructionProgressDescription;
            s.ContactPhone = dto.ContactPhone;
            s.WhatsAppLink = dto.WhatsAppLink;
            s.TelegramLink = dto.TelegramLink;

            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
