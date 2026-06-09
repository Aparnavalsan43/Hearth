using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Hearth.Api.Migrations
{
    /// <inheritdoc />
    public partial class RemoveCreatedAtFromBill : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "Bills",
                newName: "CreatedDate");

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "Bills",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Bills",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "ModifiedBy",
                table: "Bills",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ModifiedDate",
                table: "Bills",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Bills");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Bills");

            migrationBuilder.DropColumn(
                name: "ModifiedBy",
                table: "Bills");

            migrationBuilder.DropColumn(
                name: "ModifiedDate",
                table: "Bills");

            migrationBuilder.RenameColumn(
                name: "CreatedDate",
                table: "Bills",
                newName: "CreatedAt");
        }
    }
}
