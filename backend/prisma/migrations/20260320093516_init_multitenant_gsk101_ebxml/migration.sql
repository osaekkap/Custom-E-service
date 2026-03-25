-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'TENANT_ADMIN', 'USER', 'VIEWER');

-- CreateEnum
CREATE TYPE "CustomerStatus" AS ENUM ('ACTIVE', 'TRIAL', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "BillingType" AS ENUM ('PER_JOB', 'TERM');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('EXPORT', 'IMPORT');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('DRAFT', 'PREPARING', 'READY', 'GENERATING', 'READY_TO_SUBMIT', 'SUBMITTING', 'SUBMITTED', 'NSW_PROCESSING', 'CUSTOMS_REVIEW', 'CLEARED', 'COMPLETED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TransportMode" AS ENUM ('SEA', 'AIR', 'LAND', 'POST');

-- CreateEnum
CREATE TYPE "DeclarationType" AS ENUM ('WITH_PRIVILEGE', 'WITHOUT_PRIVILEGE');

-- CreateEnum
CREATE TYPE "SubmissionMethod" AS ENUM ('NSW_API', 'PLAYWRIGHT', 'CSV_EXPORT');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'SUCCESS', 'FAILED', 'RETRY');

-- CreateEnum
CREATE TYPE "EbxmlAckStatus" AS ENUM ('WAITING', 'RECEIVED', 'TIMEOUT', 'FAILED');

-- CreateEnum
CREATE TYPE "NswMessageStatus" AS ENUM ('NOT_SENT', 'UN_AUTHORIZED', 'NOT_RECOGNIZED', 'RECEIVED', 'PROCESSED', 'FORWARDED', 'CLEARED', 'REJECTED');

-- CreateEnum
CREATE TYPE "BillingItemType" AS ENUM ('DECLARATION_FEE', 'AI_EXTRACTION_FEE', 'NSW_SUBMISSION_FEE', 'CUSTOMS_SERVICE_FEE');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('COMMERCIAL_INVOICE', 'PACKING_LIST', 'BOOKING_CONFIRMATION', 'EXPORT_DECLARATION', 'NETBAY_CSV', 'CUSTOMS_RECEIPT', 'OTHER');

-- CreateEnum
CREATE TYPE "HsVerificationStatus" AS ENUM ('AI_MATCHED', 'AI_LOW_CONF', 'MANUAL', 'MISSING');

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "companyNameTh" VARCHAR(255) NOT NULL,
    "companyNameEn" VARCHAR(255),
    "taxId" VARCHAR(15) NOT NULL,
    "address" TEXT,
    "postcode" VARCHAR(10),
    "phone" VARCHAR(20),
    "email" VARCHAR(255),
    "brokerName" VARCHAR(255),
    "brokerTaxId" VARCHAR(15),
    "agentCardNo" VARCHAR(50),
    "agentName" VARCHAR(255),
    "billingType" "BillingType" NOT NULL DEFAULT 'PER_JOB',
    "termDays" INTEGER,
    "pricePerJob" DECIMAL(10,2) NOT NULL DEFAULT 450,
    "customsUsername" VARCHAR(255),
    "customsPasswordEnc" TEXT,
    "nswAgentCode" VARCHAR(50),
    "customsExporterId" VARCHAR(50),
    "nswCpaId" VARCHAR(200),
    "nswPartyId" VARCHAR(200),
    "nswEndpointUrl" VARCHAR(500),
    "nswSecurityProfile" INTEGER NOT NULL DEFAULT 1,
    "status" "CustomerStatus" NOT NULL DEFAULT 'ACTIVE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerUser" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HsMasterItem" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "hsCode" VARCHAR(20) NOT NULL,
    "descriptionEn" VARCHAR(500) NOT NULL,
    "descriptionTh" VARCHAR(500) NOT NULL,
    "statisticsCode" VARCHAR(20),
    "statisticsUnit" VARCHAR(20),
    "dutyRate" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "isControlled" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HsMasterItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exporter" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "nameTh" VARCHAR(255) NOT NULL,
    "nameEn" VARCHAR(255),
    "taxId" VARCHAR(15) NOT NULL,
    "address" TEXT,
    "postcode" VARCHAR(10),
    "phone" VARCHAR(20),
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exporter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrivilegeCode" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "nameTh" VARCHAR(255) NOT NULL,
    "nameEn" VARCHAR(255),
    "type" VARCHAR(50) NOT NULL,
    "taxBenefit" VARCHAR(255),
    "refNumber" VARCHAR(100),
    "expiryDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrivilegeCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Consignee" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "nameTh" VARCHAR(255),
    "nameEn" VARCHAR(255) NOT NULL,
    "country" VARCHAR(100) NOT NULL,
    "countryCode" VARCHAR(5) NOT NULL,
    "address" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Consignee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogisticsJob" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "jobNo" VARCHAR(30) NOT NULL,
    "type" "JobType" NOT NULL DEFAULT 'EXPORT',
    "status" "JobStatus" NOT NULL DEFAULT 'DRAFT',
    "vesselName" VARCHAR(255),
    "voyageNo" VARCHAR(50),
    "transportMode" "TransportMode" NOT NULL DEFAULT 'SEA',
    "etd" TIMESTAMP(3),
    "eta" TIMESTAMP(3),
    "portOfLoading" VARCHAR(100),
    "portOfLoadingCode" VARCHAR(10),
    "portOfDischarge" VARCHAR(100),
    "portOfReleaseCode" VARCHAR(10),
    "containerNo" VARCHAR(50),
    "sealNo" VARCHAR(50),
    "consigneeId" TEXT,
    "consigneeNameEn" VARCHAR(255),
    "consigneeAddr" TEXT,
    "totalFobUsd" DECIMAL(15,2),
    "totalFobThb" DECIMAL(15,2),
    "currency" VARCHAR(5) NOT NULL DEFAULT 'USD',
    "nswRefNo" VARCHAR(100),
    "customsRefNo" VARCHAR(100),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LogisticsJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobStatusHistory" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "fromStatus" "JobStatus",
    "toStatus" "JobStatus" NOT NULL,
    "changedBy" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobDocument" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "fileName" VARCHAR(255) NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSizeKb" INTEGER,
    "mimeType" VARCHAR(100),
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExportDeclaration" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "declarationNo" VARCHAR(50),
    "declarationType" "DeclarationType" NOT NULL DEFAULT 'WITH_PRIVILEGE',
    "invoiceRef" VARCHAR(100),
    "agentCardNo" VARCHAR(50),
    "agentName" VARCHAR(255),
    "brokerName" VARCHAR(255),
    "brokerTaxId" VARCHAR(15),
    "totalDutyThb" DECIMAL(15,2),
    "securityDeposit" DECIMAL(15,2),
    "transportMode" "TransportMode" NOT NULL DEFAULT 'SEA',
    "dutyPaymentRef" VARCHAR(100),
    "portOfRelease" VARCHAR(100),
    "portOfReleaseCode" VARCHAR(10),
    "portOfLoading" VARCHAR(100),
    "portOfLoadingCode" VARCHAR(10),
    "soldToCountry" VARCHAR(100),
    "soldToCountryCode" VARCHAR(5),
    "destinationCountry" VARCHAR(100),
    "destinationCode" VARCHAR(5),
    "totalPackages" INTEGER,
    "totalPackagesThai" VARCHAR(200),
    "exchangeRate" DECIMAL(10,4),
    "exchangeCurrency" VARCHAR(5),
    "exchangeRateDate" TIMESTAMP(3),
    "officerNote" TEXT,
    "totalFobThb" DECIMAL(15,2),
    "signatoryName" VARCHAR(255),
    "signedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "exporterTaxId" VARCHAR(17),
    "exporterBranch" VARCHAR(6),
    "exporterNameTh" VARCHAR(120),
    "exporterNameEn" VARCHAR(70),
    "exporterAddress" VARCHAR(70),
    "agentBranch" VARCHAR(6),
    "managerIdCard" VARCHAR(17),
    "managerName" VARCHAR(35),
    "cargoTypeCode" VARCHAR(1),
    "vesselName" VARCHAR(35),
    "departureDate" TIMESTAMP(3),
    "masterBl" VARCHAR(35),
    "houseBl" VARCHAR(35),
    "shippingMarks" VARCHAR(512),
    "packageUnitCode" VARCHAR(2),
    "totalNetWeight" DECIMAL(11,3),
    "netWeightUnit" VARCHAR(3),
    "totalGrossWeight" DECIMAL(11,3),
    "grossWeightUnit" VARCHAR(3),
    "totalFobForeign" DECIMAL(16,2),
    "paymentMethod" VARCHAR(1),
    "guaranteeMethod" VARCHAR(1),
    "nswReferenceNumber" VARCHAR(13),
    "declarationDocType" VARCHAR(1),
    "nswRegistrationId" VARCHAR(35),
    "exportTaxIncentivesId" VARCHAR(17),
    "submissionMethod" "SubmissionMethod",
    "submissionStatus" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "submissionRef" VARCHAR(100),
    "submissionLog" TEXT,
    "screenshotUrls" TEXT[],
    "ebxmlMessageId" VARCHAR(255),
    "ebxmlConversationId" VARCHAR(255),
    "ebxmlCpaId" VARCHAR(255),
    "ebxmlAckStatus" "EbxmlAckStatus" NOT NULL DEFAULT 'WAITING',
    "ebxmlAckReceivedAt" TIMESTAMP(3),
    "ebxmlRetryCount" INTEGER NOT NULL DEFAULT 0,
    "ebxmlLastSentAt" TIMESTAMP(3),
    "nswMessageStatus" "NswMessageStatus" NOT NULL DEFAULT 'NOT_SENT',
    "nswStatusCheckedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExportDeclaration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NswSubmission" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "declarationId" TEXT NOT NULL,
    "ebxmlMessageId" VARCHAR(255) NOT NULL,
    "attemptNo" INTEGER NOT NULL DEFAULT 1,
    "soapAction" VARCHAR(100),
    "endpointUrl" VARCHAR(500),
    "requestBody" TEXT,
    "requestSentAt" TIMESTAMP(3) NOT NULL,
    "httpStatusCode" INTEGER,
    "responseBody" TEXT,
    "respondedAt" TIMESTAMP(3),
    "ackStatus" "EbxmlAckStatus" NOT NULL DEFAULT 'WAITING',
    "ackReceivedAt" TIMESTAMP(3),
    "ackRefMessageId" VARCHAR(255),
    "nswMessageStatus" "NswMessageStatus" NOT NULL DEFAULT 'NOT_SENT',
    "nswTimestamp" TIMESTAMP(3),
    "errorCode" VARCHAR(100),
    "errorSeverity" VARCHAR(20),
    "errorLocation" VARCHAR(255),
    "errorDetail" TEXT,
    "screenshotUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NswSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeclarationItem" (
    "id" TEXT NOT NULL,
    "declarationId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "seqNo" INTEGER NOT NULL,
    "packageMark" VARCHAR(255),
    "packageQty" INTEGER,
    "packageType" VARCHAR(100),
    "descriptionEn" VARCHAR(500) NOT NULL,
    "descriptionTh" VARCHAR(500),
    "brandName" VARCHAR(200),
    "netWeightKg" DECIMAL(12,4),
    "quantity" DECIMAL(15,4) NOT NULL,
    "quantityUnit" VARCHAR(20) NOT NULL,
    "hsCode" VARCHAR(20) NOT NULL,
    "hsVerification" "HsVerificationStatus" NOT NULL DEFAULT 'MISSING',
    "hsConfidence" DOUBLE PRECISION,
    "statisticsCode" VARCHAR(20),
    "statisticsUnit" VARCHAR(20),
    "fobForeign" DECIMAL(15,4) NOT NULL,
    "fobCurrency" VARCHAR(5) NOT NULL DEFAULT 'USD',
    "fobThb" DECIMAL(15,2),
    "dutyAssessValue" DECIMAL(15,2),
    "privilegeCode" VARCHAR(50),
    "privilegeRef" VARCHAR(100),
    "dutyRate" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "exportDutyThb" DECIMAL(15,2),
    "exportLicenseNo" VARCHAR(100),
    "exportLicenseIssuer" VARCHAR(200),
    "exportLicenseDate" TIMESTAMP(3),
    "exportLicenseExpiry" TIMESTAMP(3),
    "sourceInvoiceNo" VARCHAR(50),
    "sourceProductCode" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeclarationItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingItem" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "type" "BillingItemType" NOT NULL DEFAULT 'DECLARATION_FEE',
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(5) NOT NULL DEFAULT 'THB',
    "isInvoiced" BOOLEAN NOT NULL DEFAULT false,
    "invoiceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingInvoice" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "invoiceNo" VARCHAR(30) NOT NULL,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(5) NOT NULL DEFAULT 'THB',
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "dueDate" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "note" TEXT,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "customerId" TEXT,
    "actorId" TEXT,
    "actorEmail" VARCHAR(255),
    "action" VARCHAR(100) NOT NULL,
    "entityType" VARCHAR(50),
    "entityId" VARCHAR(50),
    "ipAddress" VARCHAR(50),
    "userAgent" TEXT,
    "detail" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_code_key" ON "Customer"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_taxId_key" ON "Customer"("taxId");

-- CreateIndex
CREATE INDEX "Customer_taxId_idx" ON "Customer"("taxId");

-- CreateIndex
CREATE INDEX "Customer_code_idx" ON "Customer"("code");

-- CreateIndex
CREATE INDEX "CustomerUser_customerId_idx" ON "CustomerUser"("customerId");

-- CreateIndex
CREATE INDEX "CustomerUser_profileId_idx" ON "CustomerUser"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerUser_customerId_profileId_key" ON "CustomerUser"("customerId", "profileId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_email_key" ON "Profile"("email");

-- CreateIndex
CREATE INDEX "HsMasterItem_customerId_idx" ON "HsMasterItem"("customerId");

-- CreateIndex
CREATE INDEX "HsMasterItem_customerId_hsCode_idx" ON "HsMasterItem"("customerId", "hsCode");

-- CreateIndex
CREATE UNIQUE INDEX "HsMasterItem_customerId_hsCode_key" ON "HsMasterItem"("customerId", "hsCode");

-- CreateIndex
CREATE INDEX "Exporter_customerId_idx" ON "Exporter"("customerId");

-- CreateIndex
CREATE INDEX "PrivilegeCode_customerId_idx" ON "PrivilegeCode"("customerId");

-- CreateIndex
CREATE INDEX "Consignee_customerId_idx" ON "Consignee"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "LogisticsJob_jobNo_key" ON "LogisticsJob"("jobNo");

-- CreateIndex
CREATE INDEX "LogisticsJob_customerId_idx" ON "LogisticsJob"("customerId");

-- CreateIndex
CREATE INDEX "LogisticsJob_customerId_status_idx" ON "LogisticsJob"("customerId", "status");

-- CreateIndex
CREATE INDEX "LogisticsJob_jobNo_idx" ON "LogisticsJob"("jobNo");

-- CreateIndex
CREATE INDEX "LogisticsJob_customerId_createdAt_idx" ON "LogisticsJob"("customerId", "createdAt");

-- CreateIndex
CREATE INDEX "JobStatusHistory_jobId_idx" ON "JobStatusHistory"("jobId");

-- CreateIndex
CREATE INDEX "JobDocument_jobId_idx" ON "JobDocument"("jobId");

-- CreateIndex
CREATE INDEX "JobDocument_customerId_idx" ON "JobDocument"("customerId");

-- CreateIndex
CREATE INDEX "ExportDeclaration_customerId_idx" ON "ExportDeclaration"("customerId");

-- CreateIndex
CREATE INDEX "ExportDeclaration_jobId_idx" ON "ExportDeclaration"("jobId");

-- CreateIndex
CREATE INDEX "ExportDeclaration_declarationNo_idx" ON "ExportDeclaration"("declarationNo");

-- CreateIndex
CREATE INDEX "ExportDeclaration_ebxmlMessageId_idx" ON "ExportDeclaration"("ebxmlMessageId");

-- CreateIndex
CREATE INDEX "ExportDeclaration_ebxmlAckStatus_idx" ON "ExportDeclaration"("ebxmlAckStatus");

-- CreateIndex
CREATE INDEX "ExportDeclaration_nswMessageStatus_idx" ON "ExportDeclaration"("nswMessageStatus");

-- CreateIndex
CREATE INDEX "NswSubmission_customerId_idx" ON "NswSubmission"("customerId");

-- CreateIndex
CREATE INDEX "NswSubmission_jobId_idx" ON "NswSubmission"("jobId");

-- CreateIndex
CREATE INDEX "NswSubmission_declarationId_idx" ON "NswSubmission"("declarationId");

-- CreateIndex
CREATE INDEX "NswSubmission_ebxmlMessageId_idx" ON "NswSubmission"("ebxmlMessageId");

-- CreateIndex
CREATE INDEX "NswSubmission_ackStatus_idx" ON "NswSubmission"("ackStatus");

-- CreateIndex
CREATE INDEX "NswSubmission_createdAt_idx" ON "NswSubmission"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "NswSubmission_declarationId_attemptNo_key" ON "NswSubmission"("declarationId", "attemptNo");

-- CreateIndex
CREATE INDEX "DeclarationItem_declarationId_idx" ON "DeclarationItem"("declarationId");

-- CreateIndex
CREATE INDEX "DeclarationItem_customerId_idx" ON "DeclarationItem"("customerId");

-- CreateIndex
CREATE INDEX "DeclarationItem_customerId_hsCode_idx" ON "DeclarationItem"("customerId", "hsCode");

-- CreateIndex
CREATE UNIQUE INDEX "DeclarationItem_declarationId_seqNo_key" ON "DeclarationItem"("declarationId", "seqNo");

-- CreateIndex
CREATE UNIQUE INDEX "BillingItem_jobId_key" ON "BillingItem"("jobId");

-- CreateIndex
CREATE INDEX "BillingItem_customerId_idx" ON "BillingItem"("customerId");

-- CreateIndex
CREATE INDEX "BillingItem_customerId_isInvoiced_idx" ON "BillingItem"("customerId", "isInvoiced");

-- CreateIndex
CREATE UNIQUE INDEX "BillingInvoice_invoiceNo_key" ON "BillingInvoice"("invoiceNo");

-- CreateIndex
CREATE INDEX "BillingInvoice_customerId_idx" ON "BillingInvoice"("customerId");

-- CreateIndex
CREATE INDEX "BillingInvoice_customerId_status_idx" ON "BillingInvoice"("customerId", "status");

-- CreateIndex
CREATE INDEX "AuditLog_customerId_idx" ON "AuditLog"("customerId");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "CustomerUser" ADD CONSTRAINT "CustomerUser_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerUser" ADD CONSTRAINT "CustomerUser_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HsMasterItem" ADD CONSTRAINT "HsMasterItem_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exporter" ADD CONSTRAINT "Exporter_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrivilegeCode" ADD CONSTRAINT "PrivilegeCode_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consignee" ADD CONSTRAINT "Consignee_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogisticsJob" ADD CONSTRAINT "LogisticsJob_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogisticsJob" ADD CONSTRAINT "LogisticsJob_consigneeId_fkey" FOREIGN KEY ("consigneeId") REFERENCES "Consignee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobStatusHistory" ADD CONSTRAINT "JobStatusHistory_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "LogisticsJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobDocument" ADD CONSTRAINT "JobDocument_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "LogisticsJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExportDeclaration" ADD CONSTRAINT "ExportDeclaration_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "LogisticsJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NswSubmission" ADD CONSTRAINT "NswSubmission_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NswSubmission" ADD CONSTRAINT "NswSubmission_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "LogisticsJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NswSubmission" ADD CONSTRAINT "NswSubmission_declarationId_fkey" FOREIGN KEY ("declarationId") REFERENCES "ExportDeclaration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeclarationItem" ADD CONSTRAINT "DeclarationItem_declarationId_fkey" FOREIGN KEY ("declarationId") REFERENCES "ExportDeclaration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingItem" ADD CONSTRAINT "BillingItem_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingItem" ADD CONSTRAINT "BillingItem_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "LogisticsJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingItem" ADD CONSTRAINT "BillingItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "BillingInvoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingInvoice" ADD CONSTRAINT "BillingInvoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

