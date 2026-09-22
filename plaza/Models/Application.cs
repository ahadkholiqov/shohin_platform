namespace plaza.Models
{
    public enum ApplicationStatus
    {
        New,
        InProgress,
        Closed
    }

    public class Application
    {
        public Guid Id { get; set; }

        public string Name { get; set; } = null!;
        public string Phone { get; set; } = null!;
        public string? Comment { get; set; }

        public Guid? ApartmentId { get; set; }
        public Apartment? Apartment { get; set; }

        public DateTimeOffset CreatedAt { get; set; }

        public ApplicationStatus Status { get; set; } = ApplicationStatus.New;
    }
}
