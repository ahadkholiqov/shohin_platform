namespace plaza.Models
{
    public enum GalleryCategory
    {
        Construction,
        Renders
    }

    public class GalleryItem
    {
        public Guid Id { get; set; }

        public string ImageUrl { get; set; } = null!;
        public GalleryCategory Category { get; set; }
        public int DisplayOrder { get; set; }
    }
}
