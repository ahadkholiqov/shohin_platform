using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using plaza.Data;
using plaza.DTOs;
using plaza.Models;
using plaza.Utils;

namespace plaza.Controllers
{
    [ApiController]
    [Route("api/apartments")]
    public class ApartmentsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public ApartmentsController(AppDbContext db) => _db = db;

        [HttpGet]
        public async Task<ActionResult<List<ApartmentListItemDto>>> GetCatalog(
            [FromQuery] string? block,
            [FromQuery] int? floor,
            [FromQuery] int? rooms,
            [FromQuery] ApartmentStatus? status,
            [FromQuery] decimal? minPrice,
            [FromQuery] decimal? maxPrice)
        {
            var query = _db.Apartments.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(block)) query = query.Where(a => a.Block == block);
            if (floor.HasValue) query = query.Where(a => a.Floor == floor.Value);
            if (rooms.HasValue) query = query.Where(a => a.RoomsCount == rooms.Value);
            if (status.HasValue) query = query.Where(a => a.Status == status.Value);
            if (minPrice.HasValue) query = query.Where(a => a.TotalPrice >= minPrice.Value);
            if (maxPrice.HasValue) query = query.Where(a => a.TotalPrice <= maxPrice.Value);

            var items = await query
                .OrderBy(a => a.Block).ThenBy(a => a.Floor).ThenBy(a => a.Number)
                .Select(a => new ApartmentListItemDto(
                    a.Id, a.Block, a.Floor, a.Number, a.RoomsCount,
                    a.TotalArea, a.TotalPrice, a.Status, a.Floor == 17))
                .ToListAsync();

            return Ok(items);
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<ApartmentDetailDto>> GetById(Guid id)
        {
            var dto = await _db.Apartments.AsNoTracking()
                .Where(a => a.Id == id)
                .Select(a => new ApartmentDetailDto(
                    a.Id, a.Block, a.Floor, a.Number, a.RoomsCount,
                    a.TotalArea, a.PricePerSqm, a.TotalPrice, a.Status,
                    a.FloorPlanImageUrl, a.Description, a.Floor == 17))
                .FirstOrDefaultAsync();

            return dto is null ? NotFound() : Ok(dto);
        }

        [HttpGet("chessboard")]
        public async Task<ActionResult<List<ChessboardBlockDto>>> GetChessboard()
        {
            var cells = await _db.Apartments.AsNoTracking()
                .OrderBy(a => a.Block).ThenByDescending(a => a.Floor).ThenBy(a => a.Number)
                .Select(a => new
                {
                    a.Block,
                    a.Floor,
                    Cell = new ChessboardCellDto(
                        a.Id, a.Number, a.RoomsCount, a.TotalArea, a.TotalPrice, a.Status, a.Floor == 17)
                })
                .ToListAsync();

            var grouped = cells
                .GroupBy(x => x.Block)
                .Select(blockGroup => new ChessboardBlockDto(
                    blockGroup.Key,
                    blockGroup
                        .GroupBy(x => x.Floor)
                        .OrderByDescending(fg => fg.Key)
                        .Select(fg => new ChessboardFloorDto(
                            fg.Key,
                            fg.Select(x => x.Cell).ToList()))
                        .ToList()))
                .ToList();

            return Ok(grouped);
        }

        [HttpPost("/api/admin/apartments")]
        public async Task<ActionResult<ApartmentDetailDto>> Create(ApartmentCreateDto dto)
        {
            var apartment = new Apartment
            {
                Id = Guid.NewGuid(),
                Block = dto.Block,
                Floor = dto.Floor,
                Number = Homoglyphs.NormalizeToCyrillic(dto.Number.Trim()),
                RoomsCount = dto.RoomsCount,
                TotalArea = dto.TotalArea,
                PricePerSqm = dto.PricePerSqm,
                Status = dto.Status,
                FloorPlanImageUrl = dto.FloorPlanImageUrl,
                Description = dto.Description
            };

            _db.Apartments.Add(apartment);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = apartment.Id },
                new ApartmentDetailDto(
                    apartment.Id, apartment.Block, apartment.Floor, apartment.Number,
                    apartment.RoomsCount, apartment.TotalArea, apartment.PricePerSqm,
                    apartment.TotalPrice, apartment.Status, apartment.FloorPlanImageUrl,
                    apartment.Description, apartment.IsPenthouse));
        }

        [HttpPut("/api/admin/apartments/{id:guid}")]
        public async Task<IActionResult> Update(Guid id, ApartmentUpdateDto dto)
        {
            var apartment = await _db.Apartments.FirstOrDefaultAsync(a => a.Id == id);
            if (apartment is null) return NotFound();

            apartment.Block = dto.Block;
            apartment.Floor = dto.Floor;
            apartment.Number = Homoglyphs.NormalizeToCyrillic(dto.Number.Trim());
            apartment.RoomsCount = dto.RoomsCount;
            apartment.TotalArea = dto.TotalArea;
            apartment.PricePerSqm = dto.PricePerSqm;
            apartment.Status = dto.Status;
            apartment.FloorPlanImageUrl = dto.FloorPlanImageUrl;
            apartment.Description = dto.Description;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("/api/admin/apartments/{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var apartment = await _db.Apartments.FirstOrDefaultAsync(a => a.Id == id);
            if (apartment is null) return NotFound();

            _db.Apartments.Remove(apartment);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
