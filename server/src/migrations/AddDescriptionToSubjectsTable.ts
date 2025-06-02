import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDescriptionToSubjectsTable1718370000000 implements MigrationInterface {
    name = 'AddDescriptionToSubjectsTable1718370000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subjects" ADD "description" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subjects" DROP COLUMN "description"`);
    }
} 