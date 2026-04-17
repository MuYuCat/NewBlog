-- AlterTable
ALTER TABLE `GameSyncConfig` ADD COLUMN `errorMessage` TEXT NULL,
    ADD COLUMN `lastErrorLog` JSON NULL,
    MODIFY `config` JSON NULL;
