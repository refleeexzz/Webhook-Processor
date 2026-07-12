/*
  Warnings:

  - A unique constraint covering the columns `[idempotencyKey]` on the table `events` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "events" ADD COLUMN     "idempotencyKey" TEXT;

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idempotency_cache" (
    "key" TEXT NOT NULL,
    "response" JSONB NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idempotency_cache_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "idempotency_cache_expiresAt_idx" ON "idempotency_cache"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "events_idempotencyKey_key" ON "events"("idempotencyKey");

-- CreateIndex
CREATE INDEX "events_idempotencyKey_idx" ON "events"("idempotencyKey");
