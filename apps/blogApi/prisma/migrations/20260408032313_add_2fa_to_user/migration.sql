-- AlterTable
ALTER TABLE `User` ADD COLUMN `isTwoFactorEnabled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `twoFactorSecret` VARCHAR(191) NULL;
