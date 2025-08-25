import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1756083665626 implements MigrationInterface {
  name = 'Migration1756083665626';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Extensions needed: uuid-ossp for uuid_generate_v4(), citext for case-insensitive email
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "citext"`);

    await queryRunner.query(`
      CREATE TABLE "permission" (
                                  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                                  "name" character varying(100) NOT NULL,
                                  "description" character varying(255),
                                  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                                  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                                  CONSTRAINT "PK_3b8b97af9d9d8807e41e6f48362" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_240853a0c3353c25fb12434ad3" ON "permission" ("name")
    `);

    await queryRunner.query(`
      CREATE TABLE "role" (
                            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                            "name" character varying(64) NOT NULL,
                            "description" character varying(255),
                            "is_active" boolean NOT NULL DEFAULT true,
                            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                            "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                            CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_ae4578dcaed5adff96595e6166" ON "role" ("name")
    `);

    await queryRunner.query(`
      CREATE TABLE "o_auth_account" (
                                      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                                      "provider" character varying(50) NOT NULL,
                                      "provider_user_id" character varying(255) NOT NULL,
                                      "access_token" text,
                                      "refresh_token" text,
                                      "expires_at" TIMESTAMP WITH TIME ZONE,
                                      "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                                      "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                                      "user_id" uuid,
                                      CONSTRAINT "PK_c6d5ec585a70cc98562375fafc7" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_1447359a831bec1e7bf74cdd38" ON "o_auth_account" ("provider", "provider_user_id")
    `);

    await queryRunner.query(`
      CREATE TABLE "user_role" (
                                 "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                                 "user_id" uuid NOT NULL,
                                 "role_id" uuid NOT NULL,
                                 CONSTRAINT "UQ_f634684acb47c1a158b83af5150" UNIQUE ("user_id", "role_id"),
                                 CONSTRAINT "PK_fb2e442d14add3cefbdf33c4561" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_d0e5815877f7395a198a4cb0a4" ON "user_role" ("user_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_32a6fc2fcb019d8e3a8ace0f55" ON "user_role" ("role_id")
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."app_user_gender_enum" AS ENUM('male', 'female', 'other')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."app_user_activity_level_enum" AS ENUM(
        'sedentary',
        'light',
        'moderate',
        'active',
        'very_active'
      )
    `);

    // app_user with case-insensitive email (citext) and username uniqueness via LOWER(username)
    await queryRunner.query(`
      CREATE TABLE "app_user" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "username" character varying(30) NOT NULL,
        "email" citext NOT NULL,
        "password_hash" character varying NOT NULL,
        "email_verified" boolean NOT NULL DEFAULT false,
        "first_name" character varying(50),
        "last_name" character varying(50),
        "avatar_url" character varying,
        "height" numeric(5, 2),
        "current_weight" numeric(5, 2),
        "target_weight" numeric(5, 2),
        "date_of_birth" date,
        "gender" "public"."app_user_gender_enum",
        "activity_level" "public"."app_user_activity_level_enum" NOT NULL DEFAULT 'sedentary',
        "total_points" integer NOT NULL DEFAULT '0',
        "level" integer NOT NULL DEFAULT '1',
        "streak_days" integer NOT NULL DEFAULT '0',
        "organization_id" uuid,
        "last_login_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        -- Keep unique constraint on email (citext makes it case-insensitive)
        CONSTRAINT "UQ_3fa909d0e37c531ebc237703391" UNIQUE ("email"),
        CONSTRAINT "PK_22a5c4a3d9b2fb8e4e73fc4ada1" PRIMARY KEY ("id")
      )
    `);

    // Case-insensitive uniqueness for username (functional unique index on LOWER(username))
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UX_app_user_username_norm" ON "app_user" (LOWER("username"))
    `);

    await queryRunner.query(`
      CREATE TABLE "role_permission" (
                                       "role_id" uuid NOT NULL,
                                       "permission_id" uuid NOT NULL,
                                       CONSTRAINT "PK_19a94c31d4960ded0dcd0397759" PRIMARY KEY ("role_id", "permission_id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_3d0a7155eafd75ddba5a701336" ON "role_permission" ("role_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_e3a3ba47b7ca00fd23be4ebd6c" ON "role_permission" ("permission_id")
    `);

    await queryRunner.query(`
      ALTER TABLE "o_auth_account"
        ADD CONSTRAINT "FK_29d00b3e31c438b1daca174d742" FOREIGN KEY ("user_id") REFERENCES "app_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "user_role"
        ADD CONSTRAINT "FK_d0e5815877f7395a198a4cb0a46" FOREIGN KEY ("user_id") REFERENCES "app_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "user_role"
        ADD CONSTRAINT "FK_32a6fc2fcb019d8e3a8ace0f55f" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "role_permission"
        ADD CONSTRAINT "FK_3d0a7155eafd75ddba5a7013368" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "role_permission"
        ADD CONSTRAINT "FK_e3a3ba47b7ca00fd23be4ebd6cf" FOREIGN KEY ("permission_id") REFERENCES "permission"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "role_permission" DROP CONSTRAINT "FK_e3a3ba47b7ca00fd23be4ebd6cf"
    `);
    await queryRunner.query(`
      ALTER TABLE "role_permission" DROP CONSTRAINT "FK_3d0a7155eafd75ddba5a7013368"
    `);
    await queryRunner.query(`
      ALTER TABLE "user_role" DROP CONSTRAINT "FK_32a6fc2fcb019d8e3a8ace0f55f"
    `);
    await queryRunner.query(`
      ALTER TABLE "user_role" DROP CONSTRAINT "FK_d0e5815877f7395a198a4cb0a46"
    `);
    await queryRunner.query(`
      ALTER TABLE "o_auth_account" DROP CONSTRAINT "FK_29d00b3e31c438b1daca174d742"
    `);

    await queryRunner.query(`DROP INDEX "public"."IDX_e3a3ba47b7ca00fd23be4ebd6c"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_3d0a7155eafd75ddba5a701336"`);

    // Drop case-insensitive username index
    await queryRunner.query(`DROP INDEX "public"."UX_app_user_username_norm"`);

    await queryRunner.query(`DROP TABLE "app_user"`);

    await queryRunner.query(`DROP TYPE "public"."app_user_activity_level_enum"`);
    await queryRunner.query(`DROP TYPE "public"."app_user_gender_enum"`);

    await queryRunner.query(`DROP INDEX "public"."IDX_32a6fc2fcb019d8e3a8ace0f55"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_d0e5815877f7395a198a4cb0a4"`);
    await queryRunner.query(`DROP TABLE "user_role"`);

    await queryRunner.query(`DROP INDEX "public"."IDX_1447359a831bec1e7bf74cdd38"`);
    await queryRunner.query(`DROP TABLE "o_auth_account"`);

    await queryRunner.query(`DROP INDEX "public"."IDX_ae4578dcaed5adff96595e6166"`);
    await queryRunner.query(`DROP TABLE "role"`);

    await queryRunner.query(`DROP INDEX "public"."IDX_240853a0c3353c25fb12434ad3"`);
    await queryRunner.query(`DROP TABLE "permission"`);

    // Drop extensions last (safe order: tables/types first)
    await queryRunner.query(`DROP EXTENSION IF EXISTS "citext"`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
  }
}
