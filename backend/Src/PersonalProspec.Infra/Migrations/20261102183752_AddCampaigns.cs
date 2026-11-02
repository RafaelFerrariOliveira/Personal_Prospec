using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PersonalProspec.Infra.Migrations
{
    /// <inheritdoc />
    public partial class AddCampaigns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Campaign",
                schema: "APP",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    request_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    name = table.Column<string>(type: "nvarchar(120)", nullable: false),
                    objective = table.Column<string>(type: "nvarchar(500)", nullable: false),
                    ideal_profile = table.Column<string>(type: "nvarchar(1000)", nullable: true),
                    segment = table.Column<string>(type: "nvarchar(120)", nullable: false),
                    services = table.Column<string>(type: "nvarchar(1000)", nullable: true),
                    differentials = table.Column<string>(type: "nvarchar(1000)", nullable: true),
                    value_proposition = table.Column<string>(type: "nvarchar(1000)", nullable: true),
                    target_lead_count = table.Column<int>(type: "int", nullable: false),
                    status = table.Column<byte>(type: "tinyint", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    business_unit_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    row_version = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Campaign", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Cnae",
                schema: "APP",
                columns: table => new
                {
                    code = table.Column<string>(type: "varchar(7)", nullable: false),
                    description = table.Column<string>(type: "nvarchar(200)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cnae", x => x.code);
                });

            migrationBuilder.CreateTable(
                name: "Municipality",
                schema: "APP",
                columns: table => new
                {
                    code = table.Column<string>(type: "char(4)", nullable: false),
                    state = table.Column<string>(type: "char(2)", nullable: false),
                    name = table.Column<string>(type: "varchar(60)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Municipality", x => x.code);
                });

            migrationBuilder.CreateTable(
                name: "CampaignCnae",
                schema: "APP",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    campaign_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    cnae_code = table.Column<string>(type: "varchar(7)", nullable: false),
                    business_unit_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CampaignCnae", x => x.id);
                    table.ForeignKey(
                        name: "FK_CampaignCnae_Campaign_campaign_id",
                        column: x => x.campaign_id,
                        principalSchema: "APP",
                        principalTable: "Campaign",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "CampaignLocation",
                schema: "APP",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    campaign_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    state = table.Column<string>(type: "char(2)", nullable: false),
                    municipality_code = table.Column<string>(type: "char(4)", nullable: false),
                    business_unit_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CampaignLocation", x => x.id);
                    table.ForeignKey(
                        name: "FK_CampaignLocation_Campaign_campaign_id",
                        column: x => x.campaign_id,
                        principalSchema: "APP",
                        principalTable: "Campaign",
                        principalColumn: "id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Campaign_business_unit_id_request_id",
                schema: "APP",
                table: "Campaign",
                columns: new[] { "business_unit_id", "request_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Campaign_business_unit_id_status_created_at",
                schema: "APP",
                table: "Campaign",
                columns: new[] { "business_unit_id", "status", "created_at" },
                descending: new[] { false, false, true });

            migrationBuilder.CreateIndex(
                name: "IX_CampaignCnae_campaign_id_cnae_code",
                schema: "APP",
                table: "CampaignCnae",
                columns: new[] { "campaign_id", "cnae_code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CampaignLocation_campaign_id_state_municipality_code",
                schema: "APP",
                table: "CampaignLocation",
                columns: new[] { "campaign_id", "state", "municipality_code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Municipality_state_name",
                schema: "APP",
                table: "Municipality",
                columns: new[] { "state", "name" });

            migrationBuilder.AddForeignKey(
                name: "FK_Event_Campaign_campaign_id",
                schema: "APP",
                table: "Event",
                column: "campaign_id",
                principalSchema: "APP",
                principalTable: "Campaign",
                principalColumn: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Event_Campaign_campaign_id",
                schema: "APP",
                table: "Event");

            migrationBuilder.DropTable(
                name: "CampaignCnae",
                schema: "APP");

            migrationBuilder.DropTable(
                name: "CampaignLocation",
                schema: "APP");

            migrationBuilder.DropTable(
                name: "Cnae",
                schema: "APP");

            migrationBuilder.DropTable(
                name: "Municipality",
                schema: "APP");

            migrationBuilder.DropTable(
                name: "Campaign",
                schema: "APP");
        }
    }
}
