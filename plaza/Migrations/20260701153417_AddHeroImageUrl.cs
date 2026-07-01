using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace plaza.Migrations
{
    /// <inheritdoc />
    public partial class AddHeroImageUrl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "HeroImageUrl",
                table: "PlatformSettings",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HeroImageUrl",
                table: "PlatformSettings");
        }
    }
}
