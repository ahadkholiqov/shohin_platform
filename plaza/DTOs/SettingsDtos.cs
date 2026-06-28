using System.ComponentModel.DataAnnotations;

namespace plaza.DTOs
{
    public record SettingsDto(
        string HeroTitle,
        string ConstructionProgressDescription,
        int ConstructionProgressPercent,
        string CompletionYear,
        string ContactPhone,
        string WhatsAppLink,
        string TelegramLink);

    public class SettingsUpdateDto
    {
        [Required]
        public string HeroTitle { get; set; } = null!;

        [Required]
        public string ConstructionProgressDescription { get; set; } = null!;

        [Range(0, 100)]
        public int ConstructionProgressPercent { get; set; }

        [Required, MaxLength(20)]
        public string CompletionYear { get; set; } = null!;

        [Required, MaxLength(30)]
        public string ContactPhone { get; set; } = null!;

        [Required, MaxLength(2048)]
        public string WhatsAppLink { get; set; } = null!;

        [Required, MaxLength(2048)]
        public string TelegramLink { get; set; } = null!;
    }
}
