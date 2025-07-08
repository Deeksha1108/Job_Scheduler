import { MigrationInterface, QueryRunner } from 'typeorm';

export class NewInitialMigration1751882746797 implements MigrationInterface {
  name = 'NewInitialMigration1751882746797';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "bookings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying NOT NULL, "status" "public"."bookings_status_enum" NOT NULL DEFAULT 'pending', "metadata" jsonb, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_bee6805982cc1e248e94ce94957" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_38a69a58a323647f2e75eb994d" ON "bookings" ("userId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "jobs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" character varying NOT NULL, "runAt" TIMESTAMP WITH TIME ZONE NOT NULL, "payload" jsonb NOT NULL, "status" "public"."jobs_status_enum" NOT NULL DEFAULT 'pending', "isRecurring" boolean NOT NULL DEFAULT false, "lastRunAt" TIMESTAMP WITH TIME ZONE, "locked" boolean NOT NULL DEFAULT false, "metadata" jsonb, "retryCount" integer NOT NULL DEFAULT '0', "maxRetries" integer NOT NULL DEFAULT '3', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "recurringInterval" integer, CONSTRAINT "PK_cf0a6c42b72fcc7f7c237def345" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b3dc188bb49c6597addebf9a18" ON "jobs" ("type") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f1abe526e467d8cb476c6ba06c" ON "jobs" ("runAt") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f1abe526e467d8cb476c6ba06c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b3dc188bb49c6597addebf9a18"`,
    );
    await queryRunner.query(`DROP TABLE "jobs"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_38a69a58a323647f2e75eb994d"`,
    );
    await queryRunner.query(`DROP TABLE "bookings"`);
  }
}
