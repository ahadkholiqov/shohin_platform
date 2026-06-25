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

        public string Block { get; set; } = null!;   // "A" or "B"
        public int Floor { get; set; }               // 1..17
        public string Number { get; set; } = null!;
        public int RoomsCount { get; set; }

        public decimal TotalArea { get; set; }       // m², decimal(6,2)
        public decimal PricePerSqm { get; set; }     // TJS, decimal(12,2)
        public decimal TotalPrice { get; set; }      // recomputed on save

        public ApartmentStatus Status { get; set; } = ApartmentStatus.Available;

        public string? FloorPlanImageUrl { get; set; }
        public string? Description { get; set; }

        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }

        // Derived, not persisted.
        public bool IsPenthouse => Floor == 17;

        // Recompute the derived total. Called on create/update.
        public void RecalculateTotalPrice() => TotalPrice = TotalArea * PricePerSqm;
    }
}
