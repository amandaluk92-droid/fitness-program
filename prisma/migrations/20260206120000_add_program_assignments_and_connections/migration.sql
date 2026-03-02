-- CreateTable
CREATE TABLE "program_assignments" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "traineeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "program_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trainer_trainee_connections" (
    "id" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "traineeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trainer_trainee_connections_pkey" PRIMARY KEY ("id")
);

-- Migrate existing training_programs.traineeId into program_assignments
INSERT INTO "program_assignments" ("id", "programId", "traineeId", "createdAt")
SELECT gen_random_uuid()::text, "id", "traineeId", "createdAt" FROM "training_programs";

-- CreateIndex
CREATE UNIQUE INDEX "program_assignments_programId_traineeId_key" ON "program_assignments"("programId", "traineeId");

-- CreateIndex
CREATE UNIQUE INDEX "trainer_trainee_connections_trainerId_traineeId_key" ON "trainer_trainee_connections"("trainerId", "traineeId");

-- AddForeignKey
ALTER TABLE "program_assignments" ADD CONSTRAINT "program_assignments_programId_fkey" FOREIGN KEY ("programId") REFERENCES "training_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_assignments" ADD CONSTRAINT "program_assignments_traineeId_fkey" FOREIGN KEY ("traineeId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainer_trainee_connections" ADD CONSTRAINT "trainer_trainee_connections_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainer_trainee_connections" ADD CONSTRAINT "trainer_trainee_connections_traineeId_fkey" FOREIGN KEY ("traineeId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "training_programs" DROP CONSTRAINT "training_programs_traineeId_fkey";

-- AlterTable
ALTER TABLE "training_programs" DROP COLUMN "traineeId";
