-- CreateTable
CREATE TABLE "stripe_config" (
    "id" TEXT NOT NULL,
    "stripeSecretKey" TEXT,
    "stripeWebhookSecret" TEXT,
    "stripePriceIdStarter" TEXT,
    "stripePriceIdGrowth" TEXT,
    "stripePriceIdStudio" TEXT,
    "stripePriceIdPro" TEXT,
    "stripePublishableKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stripe_config_pkey" PRIMARY KEY ("id")
);
