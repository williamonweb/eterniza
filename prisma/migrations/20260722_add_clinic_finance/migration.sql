CREATE TYPE "ClinicInvoiceStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED');

CREATE TABLE "ClinicInvoice" (
  "id" TEXT NOT NULL,
  "clinicId" TEXT NOT NULL,
  "competency" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT 'Mensalidade Eterniza Pets',
  "amountCents" INTEGER NOT NULL,
  "dueDate" TIMESTAMP(3) NOT NULL,
  "status" "ClinicInvoiceStatus" NOT NULL DEFAULT 'PENDING',
  "paidAt" TIMESTAMP(3),
  "paymentMethod" TEXT,
  "receiptNumber" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ClinicInvoice_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ClinicInvoice_receiptNumber_key" ON "ClinicInvoice"("receiptNumber");
CREATE UNIQUE INDEX "ClinicInvoice_clinicId_competency_key" ON "ClinicInvoice"("clinicId", "competency");
CREATE INDEX "ClinicInvoice_status_dueDate_idx" ON "ClinicInvoice"("status", "dueDate");
CREATE INDEX "ClinicInvoice_clinicId_createdAt_idx" ON "ClinicInvoice"("clinicId", "createdAt");
ALTER TABLE "ClinicInvoice" ADD CONSTRAINT "ClinicInvoice_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
