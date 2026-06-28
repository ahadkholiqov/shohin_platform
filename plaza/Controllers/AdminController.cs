using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using plaza.Data;
using plaza.Models;

namespace plaza.Controllers
{
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _db;

        public AdminController(AppDbContext db) => _db = db;

        // Populates an empty database with demo data for UI testing.
        // Idempotent: skips apartments/settings that already exist.
        [HttpPost("/api/admin/seed")]
        public async Task<IActionResult> Seed()
        {
            var apartmentsCreated = 0;
            if (!await _db.Apartments.AnyAsync())
            {
                var apartments = BuildSeedApartments();
                _db.Apartments.AddRange(apartments);
                await _db.SaveChangesAsync();
                apartmentsCreated = apartments.Count;
            }

            var settingsCreated = false;
            if (!await _db.PlatformSettings.AnyAsync(p => p.Id == 1))
            {
                _db.PlatformSettings.Add(new PlatformSetting
                {
                    Id = 1,
                    HeroTitle = "Живите выше — ЖК Shohin Plaza",
                    ConstructionProgressDescription =
                        "Строительство идёт по графику. Готовность объекта — 45%, сдача в 2026 году.",
                    ConstructionProgressPercent = 45,
                    CompletionYear = "2026",
                    ContactPhone = "+992 92 777 77 77",
                    WhatsAppLink = "https://wa.me/992927777777",
                    TelegramLink = "https://t.me/shohinplaza",
                });
                await _db.SaveChangesAsync();
                settingsCreated = true;
            }

            return Ok(new { apartmentsCreated, settingsCreated });
        }

        // TotalPrice and timestamps are set by AppDbContext on save.
        private static List<Apartment> BuildSeedApartments() =>
        [
            new() { Id = Guid.NewGuid(), Block = "A", Floor = 3,  Number = "А-301",  RoomsCount = 1, TotalArea = 38.5m, PricePerSqm = 6180m, Status = ApartmentStatus.Available },
            new() { Id = Guid.NewGuid(), Block = "A", Floor = 4,  Number = "А-402",  RoomsCount = 2, TotalArea = 56.0m, PricePerSqm = 6180m, Status = ApartmentStatus.Reserved },
            new() { Id = Guid.NewGuid(), Block = "A", Floor = 7,  Number = "А-701",  RoomsCount = 2, TotalArea = 64.5m, PricePerSqm = 6180m, Status = ApartmentStatus.Available },
            new() { Id = Guid.NewGuid(), Block = "A", Floor = 9,  Number = "А-902",  RoomsCount = 3, TotalArea = 78.0m, PricePerSqm = 6300m, Status = ApartmentStatus.Sold },
            new() { Id = Guid.NewGuid(), Block = "A", Floor = 17, Number = "А-1701", RoomsCount = 4, TotalArea = 120.0m, PricePerSqm = 6800m, Status = ApartmentStatus.Available },
            new() { Id = Guid.NewGuid(), Block = "B", Floor = 3,  Number = "Б-305",  RoomsCount = 1, TotalArea = 37.0m, PricePerSqm = 6180m, Status = ApartmentStatus.Available },
            new() { Id = Guid.NewGuid(), Block = "B", Floor = 6,  Number = "Б-604",  RoomsCount = 2, TotalArea = 60.0m, PricePerSqm = 6180m, Status = ApartmentStatus.Reserved },
            new() { Id = Guid.NewGuid(), Block = "B", Floor = 10, Number = "Б-1003", RoomsCount = 3, TotalArea = 82.5m, PricePerSqm = 6400m, Status = ApartmentStatus.Available },
            new() { Id = Guid.NewGuid(), Block = "B", Floor = 15, Number = "Б-1502", RoomsCount = 2, TotalArea = 63.0m, PricePerSqm = 6500m, Status = ApartmentStatus.Sold },
            new() { Id = Guid.NewGuid(), Block = "B", Floor = 17, Number = "Б-1702", RoomsCount = 3, TotalArea = 125.0m, PricePerSqm = 6800m, Status = ApartmentStatus.Available },
        ];
    }
}
