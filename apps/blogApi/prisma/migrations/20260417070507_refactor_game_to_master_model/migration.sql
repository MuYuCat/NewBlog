/*
  Warnings:

  - You are about to drop the column `achieved` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `lastPlayed` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `platform` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `platformId` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `playTime` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `syncAt` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `total` on the `Game` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[igdbId]` on the table `Game` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Game_platform_platformId_key` ON `Game`;

-- AlterTable
ALTER TABLE `Game` DROP COLUMN `achieved`,
    DROP COLUMN `lastPlayed`,
    DROP COLUMN `platform`,
    DROP COLUMN `platformId`,
    DROP COLUMN `playTime`,
    DROP COLUMN `syncAt`,
    DROP COLUMN `total`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `igdbId` VARCHAR(191) NULL,
    ADD COLUMN `rating` DOUBLE NULL,
    ADD COLUMN `review` LONGTEXT NULL,
    ADD COLUMN `summary` TEXT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- CreateTable
CREATE TABLE `GamePlatform` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `gameId` INTEGER NOT NULL,
    `platform` VARCHAR(191) NOT NULL,
    `externalId` VARCHAR(191) NOT NULL,
    `playTime` INTEGER NOT NULL DEFAULT 0,
    `progress` INTEGER NOT NULL DEFAULT 0,
    `status` INTEGER NOT NULL DEFAULT 1,
    `lastPlayed` DATETIME(3) NULL,
    `syncAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `GamePlatform_gameId_idx`(`gameId`),
    UNIQUE INDEX `GamePlatform_platform_externalId_key`(`platform`, `externalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GameAchievement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `platformId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `image` VARCHAR(191) NULL,
    `rarity` VARCHAR(191) NULL,
    `isEarned` BOOLEAN NOT NULL DEFAULT false,
    `earnedAt` DATETIME(3) NULL,

    INDEX `GameAchievement_platformId_idx`(`platformId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GameSyncConfig` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `platform` VARCHAR(191) NOT NULL,
    `config` JSON NOT NULL,
    `lastSyncAt` DATETIME(3) NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `GameSyncConfig_platform_key`(`platform`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Game_igdbId_key` ON `Game`(`igdbId`);

-- AddForeignKey
ALTER TABLE `GamePlatform` ADD CONSTRAINT `GamePlatform_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `Game`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GameAchievement` ADD CONSTRAINT `GameAchievement_platformId_fkey` FOREIGN KEY (`platformId`) REFERENCES `GamePlatform`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
