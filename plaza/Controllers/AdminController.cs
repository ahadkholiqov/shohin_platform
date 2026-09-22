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
                    InstallmentTerms = "Рассрочка до 3 лет · Первоначальный взнос от 30%",
                    AmenitiesText = string.Join("\n", new[]
                    {
                        "Напротив мечети «Taqvo» — знаковый ориентир района",
                        "Детские сады и школы — в шаговой доступности",
                        "Супермаркеты, аптеки, кафе — рядом с домом",
                        "Удобная транспортная развязка, выезд в центр",
                        "Благоустроенная территория и парковка",
                        "Подземная парковка",
                        "Видеонаблюдение 24/7",
                        "Высокоскоростные лифты в каждом подъезде",
                        "Панорамные окна",
                        "Оптоволоконный интернет",
                    }),
                    ContactPhone = "+992 92 777 77 77",
                    WhatsAppLink = "https://wa.me/992927777777",
                    TelegramLink = "https://t.me/shohinplaza",
                });
                await _db.SaveChangesAsync();
                settingsCreated = true;
            }

            return Ok(new { apartmentsCreated, settingsCreated });
        }

        private static List<Apartment> BuildSeedApartments()
        {
            var rng = new Random();
            var statuses = new[] { ApartmentStatus.Available, ApartmentStatus.Reserved, ApartmentStatus.Sold };
            var apartments = new List<Apartment>();

            foreach (var block in new[] { "A", "B" })
            {
                for (var floor = 3; floor <= 16; floor++)
                {
                    for (var seq = 1; seq <= 7; seq++)
                    {
                        var isOneRoom = seq <= 4;
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
