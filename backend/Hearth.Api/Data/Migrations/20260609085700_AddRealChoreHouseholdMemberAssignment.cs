using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Hearth.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddRealChoreHouseholdMemberAssignment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AssignedToMemberId",
                table: "Chores",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Chores_AssignedToMemberId",
                table: "Chores",
                column: "AssignedToMemberId");

            migrationBuilder.AddForeignKey(
                name: "FK_Chores_HouseholdMembers_AssignedToMemberId",
                table: "Chores",
                column: "AssignedToMemberId",
                principalTable: "HouseholdMembers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Chores_HouseholdMembers_AssignedToMemberId",
                table: "Chores");

            migrationBuilder.DropIndex(
                name: "IX_Chores_AssignedToMemberId",
                table: "Chores");

            migrationBuilder.DropColumn(
                name: "AssignedToMemberId",
                table: "Chores");
        }
    }
}
