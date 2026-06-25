using System.ComponentModel.DataAnnotations;
using plaza.Models;

namespace plaza.DTOs
{
    public record GalleryItemDto(
        Guid Id,
        string ImageUrl,
        GalleryCategory Category,
        int DisplayOrder);

    public class GalleryItemCreateDto
    {
        [Required, MaxLength(2048)]
        public string ImageUrl { get; set; } = null!;

        public GalleryCategory Category { get; set; }

        public int DisplayOrder { get; set; }
    }

    public class GalleryItemUpdateDto : GalleryItemCreateDto { }
}
