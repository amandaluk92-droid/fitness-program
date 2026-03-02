-- AlterEnum
ALTER TYPE "BillingInterval" ADD VALUE 'SEMI_ANNUAL';

-- AlterTable
ALTER TABLE "stripe_config" ADD COLUMN     "stripePriceIdGrowth12mo" TEXT,
ADD COLUMN     "stripePriceIdGrowth6mo" TEXT,
ADD COLUMN     "stripePriceIdPro12mo" TEXT,
ADD COLUMN     "stripePriceIdPro6mo" TEXT,
ADD COLUMN     "stripePriceIdStarter12mo" TEXT,
ADD COLUMN     "stripePriceIdStarter6mo" TEXT,
ADD COLUMN     "stripePriceIdStudio12mo" TEXT,
ADD COLUMN     "stripePriceIdStudio6mo" TEXT;
