-- CreateIndex
CREATE INDEX "payments_userId_idx" ON "payments"("userId");

-- CreateIndex
CREATE INDEX "session_exercises_sessionId_idx" ON "session_exercises"("sessionId");

-- CreateIndex
CREATE INDEX "training_programs_trainerId_idx" ON "training_programs"("trainerId");

-- CreateIndex
CREATE INDEX "training_sessions_programId_idx" ON "training_sessions"("programId");
