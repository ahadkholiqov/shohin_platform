using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using plaza.Data;
using plaza.DTOs;
using plaza.Models;

namespace plaza.Controllers
{
    [ApiController]
    public class GalleryController : ControllerBase
    {
        private readonly AppDbContext _db;

        public GalleryController(AppDbContext db) => _db = db;

        [HttpGet("/api/gallery")]
        public async Task<ActionResult<List<GalleryItemDto>>> Get([FromQuery] GalleryCategory? category)
        {
            var query = _db.GalleryItems.AsNoTracking().AsQueryable();
            if (category.HasValue) query = query.Where(g => g.Category == category.Value);

            var items = await query
                .OrderBy(g => g.DisplayOrder)
                .Select(g => new GalleryItemDto(g.Id, g.ImageUrl, g.Category, g.DisplayOrder))
                .ToListAsync();

            return Ok(items);
        }

        [HttpPost("/api/admin/gallery")]
        public async Task<ActionResult<GalleryItemDto>> Create(GalleryItemCreateDto dto)
        {
            var item = new GalleryItem
            {
                Id = Guid.NewGuid(),
                ImageUrl = dto.ImageUrl,
                Category = dto.Category,
                DisplayOrder = dto.DisplayOrder
            };

            _db.GalleryItems.Add(item);
            await _db.SaveChangesAsync();

            return Ok(new GalleryItemDto(item.Id, item.ImageUrl, item.Category, item.DisplayOrder));
        }

        [HttpPut("/api/admin/gallery/{id:guid}")]
        public async Task<IActionResult> Update(Guid id, GalleryItemUpdateDto dto)
        {
            var item = await _db.GalleryItems.FirstOrDefaultAsync(g => g.Id == id);
            if (item is null) return NotFound();

            item.ImageUrl = dto.ImageUrl;
            item.Category = dto.Category;
            item.DisplayOrder = dto.DisplayOrder;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("/api/admin/gallery/{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var item = await _db.GalleryItems.FirstOrDefaultAsync(g => g.Id == id);
            if (item is null) return NotFound();

            _db.GalleryItems.Remove(item);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
