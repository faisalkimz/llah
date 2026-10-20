/*
  Warnings:

  - Added the required column `updatedAt` to the `Refund` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('INVOICE_SUMMARY', 'REVENUE_SUMMARY', 'SUBSCRIPTION_SUMMARY', 'USAGE_SUMMARY', 'TAX_SUMMARY');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "AlertMetric" AS ENUM ('USAGE_AMOUNT', 'INVOICE_OVERDUE_DAYS', 'PAYMENT_FAILURE_COUNT', 'MRR_DROP_PERCENT');

-- CreateEnum
CREATE TYPE "AlertOperator" AS ENUM ('GT', 'GTE', 'LT', 'LTE');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('INVOICE_CREATED', 'INVOICE_PAID', 'INVOICE_OVERDUE', 'PAYMENT_FAILED', 'SUBSCRIPTION_CANCELED', 'SUBSCRIPTION_RENEWED', 'ALERT_FIRED', 'CREDIT_APPLIED', 'REFUND_ISSUED', 'SYSTEM');

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "addressLine1" TEXT,
ADD COLUMN     "addressLine2" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "state" TEXT;

-- AlterTable
ALTER TABLE "Refund" ADD COLUMN     "status" "RefundStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "WebhookDelivery" ADD COLUMN     "payload" JSONB,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "coupons" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discountType" "DiscountType" NOT NULL,
    "discountValue" INTEGER NOT NULL,
    "maxRedemptions" INTEGER,
    "redemptionCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxRate" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rate" DECIMAL(65,30) NOT NULL,
    "country" TEXT NOT NULL,
    "region" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaxRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "type" "ReportType" NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "parameters" JSONB,
    "result" JSONB,
    "fileUrl" TEXT,
    "generatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertRule" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "metric" "AlertMetric" NOT NULL,
    "threshold" DECIMAL(65,30) NOT NULL,
    "operator" "AlertOperator" NOT NULL DEFAULT 'GT',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlertRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertFiring" (
    "id" TEXT NOT NULL,
    "alertRuleId" TEXT NOT NULL,
    "value" DECIMAL(65,30) NOT NULL,
    "firedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "AlertFiring_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "coupons_orgId_code_key" ON "coupons"("orgId", "code");

-- CreateIndex
CREATE INDEX "TaxRate_organizationId_country_idx" ON "TaxRate"("organizationId", "country");

-- CreateIndex
CREATE INDEX "Report_organizationId_type_idx" ON "Report"("organizationId", "type");

-- CreateIndex
CREATE INDEX "AlertRule_organizationId_idx" ON "AlertRule"("organizationId");

-- CreateIndex
CREATE INDEX "Notification_organizationId_read_idx" ON "Notification"("organizationId", "read");

-- CreateIndex
CREATE INDEX "Notification_organizationId_userId_idx" ON "Notification"("organizationId", "userId");

-- CreateIndex
CREATE INDEX "Customer_organizationId_email_idx" ON "Customer"("organizationId", "email");

-- AddForeignKey
ALTER TABLE "TaxRate" ADD CONSTRAINT "TaxRate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertRule" ADD CONSTRAINT "AlertRule_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertFiring" ADD CONSTRAINT "AlertFiring_alertRuleId_fkey" FOREIGN KEY ("alertRuleId") REFERENCES "AlertRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
