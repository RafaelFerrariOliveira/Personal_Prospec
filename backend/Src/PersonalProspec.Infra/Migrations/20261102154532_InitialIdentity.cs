using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PersonalProspec.Infra.Migrations
{
    /// <inheritdoc />
    public partial class InitialIdentity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "APP");

            migrationBuilder.CreateTable(
                name: "Event",
                schema: "APP",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    category = table.Column<byte>(type: "tinyint", nullable: false),
                    type = table.Column<string>(type: "varchar(100)", nullable: false),
                    company_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    campaign_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    description = table.Column<string>(type: "nvarchar(500)", nullable: false),
                    source = table.Column<string>(type: "varchar(100)", nullable: false),
                    occurred_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    business_unit_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Event", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Role",
                schema: "APP",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    name = table.Column<string>(type: "nvarchar(100)", nullable: false),
                    normalized_name = table.Column<string>(type: "nvarchar(100)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Role", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "User",
                schema: "APP",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    email = table.Column<string>(type: "nvarchar(256)", nullable: false),
                    normalized_email = table.Column<string>(type: "nvarchar(256)", nullable: false),
                    password_hash = table.Column<string>(type: "varchar(255)", nullable: false),
                    security_stamp = table.Column<string>(type: "varchar(64)", nullable: false),
                    access_failed_count = table.Column<int>(type: "int", nullable: false),
                    lockout_enabled = table.Column<bool>(type: "bit", nullable: false),
                    lockout_end = table.Column<DateTime>(type: "datetime2", nullable: true),
                    role_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    business_unit_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_User", x => x.id);
                    table.ForeignKey(
                        name: "FK_User_Role_role_id",
                        column: x => x.role_id,
                        principalSchema: "APP",
                        principalTable: "Role",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "RefreshToken",
                schema: "APP",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    user_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    token_hash = table.Column<string>(type: "varchar(64)", nullable: false),
                    expires_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    revoked_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    business_unit_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RefreshToken", x => x.id);
                    table.ForeignKey(
                        name: "FK_RefreshToken_User_user_id",
                        column: x => x.user_id,
                        principalSchema: "APP",
                        principalTable: "User",
                        principalColumn: "id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Event_campaign_id_occurred_at",
                schema: "APP",
                table: "Event",
                columns: new[] { "campaign_id", "occurred_at" });

            migrationBuilder.CreateIndex(
                name: "IX_Event_company_id_occurred_at",
                schema: "APP",
                table: "Event",
                columns: new[] { "company_id", "occurred_at" });

            migrationBuilder.CreateIndex(
                name: "IX_RefreshToken_token_hash",
                schema: "APP",
                table: "RefreshToken",
                column: "token_hash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RefreshToken_user_id",
                schema: "APP",
                table: "RefreshToken",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_Role_normalized_name",
                schema: "APP",
                table: "Role",
                column: "normalized_name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_User_normalized_email",
                schema: "APP",
                table: "User",
                column: "normalized_email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_User_role_id",
                schema: "APP",
                table: "User",
                column: "role_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Event",
                schema: "APP");

            migrationBuilder.DropTable(
                name: "RefreshToken",
                schema: "APP");

            migrationBuilder.DropTable(
                name: "User",
                schema: "APP");

            migrationBuilder.DropTable(
                name: "Role",
                schema: "APP");
        }
    }
}
