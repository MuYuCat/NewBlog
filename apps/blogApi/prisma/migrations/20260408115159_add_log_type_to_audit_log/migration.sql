-- AlterTable
ALTER TABLE `AuditLog` ADD COLUMN `logType` VARCHAR(191) NOT NULL DEFAULT 'API';

-- CreateIndex
CREATE INDEX `AuditLog_logType_idx` ON `AuditLog`(`logType`);
