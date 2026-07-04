using System.ComponentModel.DataAnnotations;

namespace plaza.DTOs
{
    public record SettingsDto(
        string HeroTitle,
        string? HeroImageUrl,
        string ConstructionProgressDescription,
        int ConstructionProgressPercent,
        string CompletionYear,
        string? InstallmentTerms,
        string? AmenitiesText,
        string ContactPhone,
        string WhatsAppLink,
        string TelegramLink);

    public class SettingsUpdateDto
    {
        [Required]
        public string HeroTitle { get; set; } = null!;

        [MaxLength(2048)]
        public string? HeroImageUrl { get; set; }

        [Required]
        public string ConstructionProgressDescription { get; set; } = null!;

        [Range(0, 100)]
        public int ConstructionProgressPercent { get; set; }

        [Required, MaxLength(20)]
        public string CompletionYear { get; set; } = null!;

        [MaxLength(500)]
        public string? InstallmentTerms { get; set; }

        [MaxLength(1000)]
        public string? AmenitiesText { get; set; }

        [Required, MaxLength(30)]
        public string ContactPhone { get; set; } = null!;

        [Required, MaxLength(2048)]
        public string WhatsAppLink { get; set; } = null!;

        [Required, MaxLength(2048)]
        public string TelegramLink { get; set; } = null!;
    }
}
