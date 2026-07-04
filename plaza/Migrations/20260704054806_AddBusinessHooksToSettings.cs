using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace plaza.Migrations
{
    /// <inheritdoc />
    public partial class AddBusinessHooksToSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AmenitiesText",
                table: "PlatformSettings",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InstallmentTerms",
                table: "PlatformSettings",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AmenitiesText",
                table: "PlatformSettings");

            migrationBuilder.DropColumn(
                name: "InstallmentTerms",
                table: "PlatformSettings");
        }
    }
}
