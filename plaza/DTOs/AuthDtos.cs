using System.ComponentModel.DataAnnotations;

namespace plaza.DTOs
{
    public class AdminLoginDto
    {
        [Required]
        public string Token { get; set; } = null!;
    }

    public record UploadResultDto(string Url);
}
