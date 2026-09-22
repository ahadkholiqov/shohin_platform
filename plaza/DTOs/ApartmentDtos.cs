using System.ComponentModel.DataAnnotations;
using plaza.Models;

namespace plaza.DTOs
{
    public record ApartmentListItemDto(
        Guid Id,
        string Block,
        int Floor,
        string Number,
        int RoomsCount,
        decimal TotalArea,
        decimal TotalPrice,
        ApartmentStatus Status,
        bool IsPenthouse);

    public record ApartmentDetailDto(
        Guid Id,
        string Block,
        int Floor,
        string Number,
        int RoomsCount,
        decimal TotalArea,
        decimal PricePerSqm,
        decimal TotalPrice,
        ApartmentStatus Status,
        string? FloorPlanImageUrl,
        string? Description,
        bool IsPenthouse);

    public record ChessboardCellDto(
        Guid Id,
        string Number,
        int RoomsCount,
        decimal TotalArea,
        decimal TotalPrice,
        ApartmentStatus Status,
        bool IsPenthouse);

    public record ChessboardFloorDto(int Floor, List<ChessboardCellDto> Apartments);

    public record ChessboardBlockDto(string Block, List<ChessboardFloorDto> Floors);

    public class ApartmentCreateDto
    {
        [Required, RegularExpression("^[AB]$", ErrorMessage = "Block must be 'A' or 'B'.")]
        public string Block { get; set; } = null!;

        [Range(1, 17, ErrorMessage = "Floor must be between 1 and 17.")]
        public int Floor { get; set; }

        [Required, MaxLength(20)]
        public string Number { get; set; } = null!;

        [Range(1, 20, ErrorMessage = "RoomsCount must be between 1 and 20.")]
        public int RoomsCount { get; set; }

        [Range(0.01, 9999.99)]
        public decimal TotalArea { get; set; }

        [Range(0.01, 9999999999.99)]
        public decimal PricePerSqm { get; set; }

        public ApartmentStatus Status { get; set; } = ApartmentStatus.Available;

        [MaxLength(2048)]
        public string? FloorPlanImageUrl { get; set; }

        public string? Description { get; set; }
    }

    public class ApartmentUpdateDto : ApartmentCreateDto { }
}
