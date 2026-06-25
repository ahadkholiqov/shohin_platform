using Microsoft.EntityFrameworkCore;
using plaza.Models;

namespace plaza.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Apartment> Apartments => Set<Apartment>();
        public DbSet<Application> Applications => Set<Application>();
        public DbSet<GalleryItem> GalleryItems => Set<GalleryItem>();
        public DbSet<PlatformSetting> PlatformSettings => Set<PlatformSetting>();

        public override int SaveChanges(bool acceptAllChangesOnSuccess)
        {
            ApplyApartmentRules();
            return base.SaveChanges(acceptAllChangesOnSuccess);
        }

        public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default)
        {
            ApplyApartmentRules();
            return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
        }

        // Recompute TotalPrice and maintain timestamps for apartments on every save.
        private void ApplyApartmentRules()
        {
            var now = DateTimeOffset.UtcNow;

            foreach (var entry in ChangeTracker.Entries<Apartment>())
            {
                if (entry.State == EntityState.Added)
                {
                    entry.Entity.CreatedAt = now;
                    entry.Entity.UpdatedAt = now;
                    entry.Entity.RecalculateTotalPrice();
                }
                else if (entry.State == EntityState.Modified)
                {
                    entry.Entity.UpdatedAt = now;
                    entry.Entity.RecalculateTotalPrice();
                }
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ---------- Apartment ----------
            modelBuilder.Entity<Apartment>(e =>
            {
                e.HasKey(a => a.Id);

                e.Property(a => a.Block).HasMaxLength(1).IsRequired();
                e.Property(a => a.Number).HasMaxLength(20).IsRequired();

                e.Property(a => a.TotalArea).HasPrecision(6, 2);
                e.Property(a => a.PricePerSqm).HasPrecision(12, 2);
                e.Property(a => a.TotalPrice).HasPrecision(12, 2);

                e.Property(a => a.Status)
                    .HasConversion<string>()
                    .HasMaxLength(20)
                    .IsRequired();

                e.Property(a => a.Description).HasColumnType("text");

                // IsPenthouse is a derived C# property; do not map it.
                e.Ignore(a => a.IsPenthouse);

                // Unique apartment identity within the complex.
                e.HasIndex(a => new { a.Block, a.Number }).IsUnique();

                // Chessboard / catalog filtering.
                e.HasIndex(a => a.Status);
                e.HasIndex(a => new { a.Block, a.Floor });

                // Check constraints.
                e.ToTable(t =>
                {
                    t.HasCheckConstraint("CK_Apartment_Block", "\"Block\" IN ('A','B')");
                    t.HasCheckConstraint("CK_Apartment_Floor", "\"Floor\" BETWEEN 1 AND 17");
                });
            });

            // ---------- Application ----------
            modelBuilder.Entity<Application>(e =>
            {
                e.HasKey(a => a.Id);

                e.Property(a => a.Name).HasMaxLength(150).IsRequired();
                e.Property(a => a.Phone).HasMaxLength(30).IsRequired();
                e.Property(a => a.Comment).HasColumnType("text");

                e.Property(a => a.Status)
                    .HasConversion<string>()
                    .HasMaxLength(20)
                    .IsRequired();

                e.HasIndex(a => a.CreatedAt);

                e.HasOne(a => a.Apartment)
                    .WithMany()
                    .HasForeignKey(a => a.ApartmentId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // ---------- GalleryItem ----------
            modelBuilder.Entity<GalleryItem>(e =>
            {
                e.HasKey(g => g.Id);

                e.Property(g => g.ImageUrl).IsRequired();

                e.Property(g => g.Category)
                    .HasConversion<string>()
                    .HasMaxLength(30)
                    .IsRequired();
            });

            // ---------- PlatformSetting (singleton) ----------
            modelBuilder.Entity<PlatformSetting>(e =>
            {
                e.HasKey(p => p.Id);

                // No identity generation: we control the single Id = 1.
                e.Property(p => p.Id).ValueGeneratedNever();

                e.Property(p => p.HeroTitle).IsRequired();
                e.Property(p => p.ConstructionProgressDescription).HasColumnType("text").IsRequired();
                e.Property(p => p.ContactPhone).HasMaxLength(30).IsRequired();
                e.Property(p => p.WhatsAppLink).IsRequired();
                e.Property(p => p.TelegramLink).IsRequired();

                e.ToTable(t => t.HasCheckConstraint("CK_PlatformSetting_SingleRow", "\"Id\" = 1"));
            });
        }
    }
}
