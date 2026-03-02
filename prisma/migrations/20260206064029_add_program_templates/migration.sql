-- CreateEnum
CREATE TYPE "TemplateCategory" AS ENUM ('GBC', 'REHAB');

-- AlterTable
ALTER TABLE "training_programs" ADD COLUMN     "sourceTemplateId" TEXT;

-- CreateTable
CREATE TABLE "program_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER,
    "category" "TemplateCategory" NOT NULL,
    "injuryType" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "program_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_template_exercises" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "sets" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION,
    "restTimeSeconds" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "dayOfWeek" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "program_template_exercises_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "training_programs" ADD CONSTRAINT "training_programs_sourceTemplateId_fkey" FOREIGN KEY ("sourceTemplateId") REFERENCES "program_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_template_exercises" ADD CONSTRAINT "program_template_exercises_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "program_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_template_exercises" ADD CONSTRAINT "program_template_exercises_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
