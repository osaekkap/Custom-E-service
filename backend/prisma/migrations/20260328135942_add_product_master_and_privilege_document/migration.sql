-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'MANAGER';
ALTER TYPE "Role" ADD VALUE 'STAFF';
ALTER TYPE "Role" ADD VALUE 'CUSTOMER_ADMIN';
ALTER TYPE "Role" ADD VALUE 'CUSTOMER';

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "companyCertUrl" TEXT,
ADD COLUMN     "pdpaAcceptedAt" TIMESTAMP(3),
ADD COLUMN     "pp20Url" TEXT,
ADD COLUMN     "registrationIp" VARCHAR(45),
ADD COLUMN     "tcAcceptedAt" TIMESTAMP(3),
ADD COLUMN     "tcVersion" VARCHAR(20),
ALTER COLUMN "status" SET DEFAULT 'TRIAL';

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "jobTitle" VARCHAR(100),
ADD COLUMN     "pdpaConsentAt" TIMESTAMP(3),
ADD COLUMN     "phone" VARCHAR(20);

-- CreateTable
CREATE TABLE "ProductMaster" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "productCode" VARCHAR(50) NOT NULL,
    "descriptionEn" VARCHAR(500) NOT NULL,
    "descriptionTh" VARCHAR(500),
    "hsCode" VARCHAR(20),
    "brandName" VARCHAR(200),
    "originCountry" VARCHAR(5),
    "defaultUnit" VARCHAR(10),
    "defaultPrice" DECIMAL(15,4),
    "defaultCurrency" VARCHAR(5),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrivilegeDocument" (
    "id" TEXT NOT NULL,
    "declarationItemId" TEXT,
    "customerId" TEXT NOT NULL,
    "privilegeType" VARCHAR(20) NOT NULL,
    "licenseNumber" VARCHAR(100),
    "expiryDate" TIMESTAMP(3),
    "fileName" VARCHAR(255) NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSizeKb" INTEGER,
    "mimeType" VARCHAR(100),
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrivilegeDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductMaster_customerId_idx" ON "ProductMaster"("customerId");

-- CreateIndex
CREATE INDEX "ProductMaster_customerId_hsCode_idx" ON "ProductMaster"("customerId", "hsCode");

-- CreateIndex
CREATE UNIQUE INDEX "ProductMaster_customerId_productCode_key" ON "ProductMaster"("customerId", "productCode");

-- CreateIndex
CREATE INDEX "PrivilegeDocument_declarationItemId_idx" ON "PrivilegeDocument"("declarationItemId");

-- CreateIndex
CREATE INDEX "PrivilegeDocument_customerId_idx" ON "PrivilegeDocument"("customerId");

-- CreateIndex
CREATE INDEX "PrivilegeDocument_customerId_privilegeType_idx" ON "PrivilegeDocument"("customerId", "privilegeType");

-- AddForeignKey
ALTER TABLE "ProductMaster" ADD CONSTRAINT "ProductMaster_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrivilegeDocument" ADD CONSTRAINT "PrivilegeDocument_declarationItemId_fkey" FOREIGN KEY ("declarationItemId") REFERENCES "DeclarationItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrivilegeDocument" ADD CONSTRAINT "PrivilegeDocument_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
