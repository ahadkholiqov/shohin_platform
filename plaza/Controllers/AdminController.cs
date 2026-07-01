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

        // TotalPrice, IsPenthouse, and timestamps are derived by AppDbContext on save.
        // Generates a full realistic building for chessboard stress-testing:
        //   Blocks A & B, floors 3-17.
        //   - Floors 3-16: 7 apartments each (4× 1-room @ 45 m², 3× 2-room @ 65 m²), 6180 TJS/m².
        //   - Floor 17:    2 penthouses (4-room @ 120 m²), 6800 TJS/m².
        //   Status is randomized (Available/Reserved/Sold) so the board looks colorful.
        //   Total = 2 blocks × (14 floors × 7 + 2) = 200 apartments.
        private static List<Apartment> BuildSeedApartments()
        {
            var rng = new Random();
            var statuses = new[] { ApartmentStatus.Available, ApartmentStatus.Reserved, ApartmentStatus.Sold };
            var apartments = new List<Apartment>();

            foreach (var block in new[] { "A", "B" })
            {
                // Regular floors: 3..16, seven apartments per floor.
                for (var floor = 3; floor <= 16; floor++)
                {
                    for (var seq = 1; seq <= 7; seq++)
                    {
                        var isOneRoom = seq <= 4; // first 4 are 1-room, last 3 are 2-room
                        apartments.Add(new Apartment
                        {
                            Id = Guid.NewGuid(),
                            Block = block,
                            Floor = floor,
                            Number = $"{floor * 100 + seq}",
                            RoomsCount = isOneRoom ? 1 : 2,
                            TotalArea = isOneRoom ? 45.0m : 65.0m,
                            PricePerSqm = 6180m,
                            Status = statuses[rng.Next(statuses.Length)],
                        });
                    }
                }

                // Penthouse floor 17: two 4-room apartments.
                for (var seq = 1; seq <= 2; seq++)
                {
                    apartments.Add(new Apartment
                    {
                        Id = Guid.NewGuid(),
                        Block = block,
                        Floor = 17,
                        Number = $"{1700 + seq}",
                        RoomsCount = 4,
                        TotalArea = 120.0m,
                        PricePerSqm = 6800m,
                        Status = statuses[rng.Next(statuses.Length)],
                    });
                }
            }

            return apartments;
        }
    }
}
