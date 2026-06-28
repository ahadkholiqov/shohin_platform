namespace plaza.Models
{
    // Singleton configuration row. Always Id = 1.
    public class PlatformSetting
    {
        public int Id { get; set; }

        public string HeroTitle { get; set; } = null!;
        public string ConstructionProgressDescription { get; set; } = null!;
        public int ConstructionProgressPercent { get; set; }
        public string CompletionYear { get; set; } = null!;
        public string ContactPhone { get; set; } = null!;
        public string WhatsAppLink { get; set; } = null!;
        public string TelegramLink { get; set; } = null!;
    }
}
