-- AlterTable
ALTER TABLE "users" ADD COLUMN     "goalWeight" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "body_weight_entries" (
    "id" TEXT NOT NULL,
    "traineeId" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "body_weight_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "body_weight_entries_traineeId_date_key" ON "body_weight_entries"("traineeId", "date");

-- AddForeignKey
ALTER TABLE "body_weight_entries" ADD CONSTRAINT "body_weight_entries_traineeId_fkey" FOREIGN KEY ("traineeId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
