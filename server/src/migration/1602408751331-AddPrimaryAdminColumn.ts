import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPrimaryAdminColumn1602408751331 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        try {
            await queryRunner.query(`ALTER TABLE "user" ADD primaryAdmin boolean DEFAULT 0 NOT NULL;`);
        }
        catch (e) {
            console.log(e);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN primaryAdmin;`);
    }
}
