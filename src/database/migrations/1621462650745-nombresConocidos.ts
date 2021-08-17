import {MigrationInterface, QueryRunner} from "typeorm";

export class nombresConocidos1621462650745 implements MigrationInterface {
    name = 'nombresConocidos1621462650745'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `agaves` DROP COLUMN `nombresConocidos`");
        await queryRunner.query("ALTER TABLE `agaves` ADD `nombresConocidos` json NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `agaves` DROP COLUMN `nombresConocidos`");
        await queryRunner.query("ALTER TABLE `agaves` ADD `nombresConocidos` text NULL");
    }

}
