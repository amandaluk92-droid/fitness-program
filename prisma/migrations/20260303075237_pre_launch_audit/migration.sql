-- AlterTable
ALTER TABLE "trainer_subscriptions" ADD COLUMN     "trialExpiresAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT,
    "resourceId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "program_assignments_traineeId_idx" ON "program_assignments"("traineeId");

-- CreateIndex
CREATE INDEX "trainer_subscriptions_trainerId_status_idx" ON "trainer_subscriptions"("trainerId", "status");

-- CreateIndex
CREATE INDEX "trainer_trainee_connections_traineeId_idx" ON "trainer_trainee_connections"("traineeId");

-- CreateIndex
CREATE INDEX "training_sessions_traineeId_date_idx" ON "training_sessions"("traineeId", "date");

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
