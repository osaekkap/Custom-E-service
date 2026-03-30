-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('NONE', 'PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('JOB_STATUS_CHANGED', 'JOB_CREATED', 'JOB_ASSIGNED', 'APPROVAL_REQUESTED', 'APPROVAL_APPROVED', 'APPROVAL_REJECTED', 'DECLARATION_READY', 'NSW_RESPONSE', 'BILLING_INVOICE', 'SYSTEM');

-- AlterTable
ALTER TABLE "LogisticsJob" ADD COLUMN     "approvalNote" TEXT,
ADD COLUMN     "approvalRequestedAt" TIMESTAMP(3),
ADD COLUMN     "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "assignedAt" TIMESTAMP(3),
ADD COLUMN     "assignedById" TEXT,
ADD COLUMN     "assignedToId" TEXT;

-- CreateTable
CREATE TABLE "ApprovalLog" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "action" VARCHAR(20) NOT NULL,
    "fromStatus" "ApprovalStatus" NOT NULL,
    "toStatus" "ApprovalStatus" NOT NULL,
    "actorId" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApprovalLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'SYSTEM',
    "title" VARCHAR(200) NOT NULL,
    "message" TEXT NOT NULL,
    "entityType" VARCHAR(50),
    "entityId" VARCHAR(50),
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ApprovalLog_jobId_idx" ON "ApprovalLog"("jobId");

-- CreateIndex
CREATE INDEX "ApprovalLog_actorId_idx" ON "ApprovalLog"("actorId");

-- CreateIndex
CREATE INDEX "Notification_recipientId_isRead_idx" ON "Notification"("recipientId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_recipientId_createdAt_idx" ON "Notification"("recipientId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_entityType_entityId_idx" ON "Notification"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "LogisticsJob_assignedToId_idx" ON "LogisticsJob"("assignedToId");

-- AddForeignKey
ALTER TABLE "ApprovalLog" ADD CONSTRAINT "ApprovalLog_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "LogisticsJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
