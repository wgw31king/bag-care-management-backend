-- AlterTable
ALTER TABLE "wash_services" ADD COLUMN "code" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "wash_services_code_key" ON "wash_services"("code");
