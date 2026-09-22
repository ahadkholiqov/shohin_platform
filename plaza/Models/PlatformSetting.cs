namespace plaza.Models
{
    public class PlatformSetting
    {
        public int Id { get; set; }

        public string HeroTitle { get; set; } = null!;
        public string? HeroImageUrl { get; set; }
        public string ConstructionProgressDescription { get; set; } = null!;
        public int ConstructionProgressPercent { get; set; }
        public string CompletionYear { get; set; } = null!;

        public string? InstallmentTerms { get; set; }
        public string? AmenitiesText { get; set; }

        public string ContactPhone { get; set; } = null!;
        public string WhatsAppLink { get; set; } = null!;
        public string TelegramLink { get; set; } = null!;
    }
}
