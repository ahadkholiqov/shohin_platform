using System.ComponentModel.DataAnnotations;
using plaza.Models;

namespace plaza.DTOs
{
    // Public lead capture.
    public class ApplicationCreateDto
    {
        [Required, MaxLength(150)]
        public string Name { get; set; } = null!;

        [Required, MaxLength(30)]
        public string Phone { get; set; } = null!;

        public string? Comment { get; set; }

        public Guid? ApartmentId { get; set; }
    }

    // Admin inbox row.
    public record ApplicationListItemDto(
        Guid Id,
        string Name,
        string Phone,
        string? Comment,
        Guid? ApartmentId,
        string? ApartmentNumber,
        string? ApartmentBlock,
        DateTimeOffset CreatedAt,
        ApplicationStatus Status);

    // Admin status change.
    public class ApplicationStatusUpdateDto
    {
        [Required]
        public ApplicationStatus Status { get; set; }
    }
}
