import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStripeSessionIdToOrder20250519152737 implements MigrationInterface {
    name = 'AddStripeSessionIdToOrder20250519152737'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Order" ADD "stripeSessionId" varchar(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Order" DROP COLUMN "stripeSessionId"`);
    }
}
