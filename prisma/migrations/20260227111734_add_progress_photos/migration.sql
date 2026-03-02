-- CreateEnum
CREATE TYPE "PhotoPose" AS ENUM ('FRONT', 'SIDE', 'BACK');

-- CreateTable
CREATE TABLE "progress_photos" (
    "id" TEXT NOT NULL,
    "traineeId" TEXT NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "pose" "PhotoPose" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "progress_photos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "progress_photos_traineeId_date_idx" ON "progress_photos"("traineeId", "date");

-- AddForeignKey
ALTER TABLE "progress_photos" ADD CONSTRAINT "progress_photos_traineeId_fkey" FOREIGN KEY ("traineeId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
