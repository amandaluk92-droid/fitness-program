-- AlterTable
ALTER TABLE "exercises" ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "emailNotifications" BOOLEAN NOT NULL DEFAULT true;
