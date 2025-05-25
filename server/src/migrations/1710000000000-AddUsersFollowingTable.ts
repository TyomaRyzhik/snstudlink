import { MigrationInterface, QueryRunner } from "typeorm"

export class AddUsersFollowingTable1710000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "users_following_users" (
                "user_id" uuid NOT NULL,
                "following_id" uuid NOT NULL,
                CONSTRAINT "PK_users_following_users" PRIMARY KEY ("user_id", "following_id"),
                CONSTRAINT "FK_users_following_users_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_users_following_users_following_id" FOREIGN KEY ("following_id") REFERENCES "users"("id") ON DELETE CASCADE
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users_following_users"`);
    }
} 