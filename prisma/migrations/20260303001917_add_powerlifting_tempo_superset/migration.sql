-- AlterEnum
ALTER TYPE "TemplateCategory" ADD VALUE 'POWERLIFTING';

-- AlterTable
ALTER TABLE "program_exercises" ADD COLUMN     "supersetGroup" TEXT,
ADD COLUMN     "tempo" TEXT;

-- AlterTable
ALTER TABLE "program_template_exercises" ADD COLUMN     "supersetGroup" TEXT,
ADD COLUMN     "tempo" TEXT;
