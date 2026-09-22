namespace plaza.Models
{
    public enum ApartmentStatus
    {
        Available,
        Reserved,
        Sold
    }

    public class Apartment
    {
        public Guid Id { get; set; }

        public string Block { get; set; } = null!;
        public int Floor { get; set; }
        public string Number { get; set; } = null!;
        public int RoomsCount { get; set; }

        public decimal TotalArea { get; set; }
        public decimal PricePerSqm { get; set; }
        public decimal TotalPrice { get; set; }

        public ApartmentStatus Status { get; set; } = ApartmentStatus.Available;

        public string? FloorPlanImageUrl { get; set; }
        public string? Description { get; set; }

        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }

        public bool IsPenthouse => Floor == 17;

        public void RecalculateTotalPrice() => TotalPrice = TotalArea * PricePerSqm;
    }
}
