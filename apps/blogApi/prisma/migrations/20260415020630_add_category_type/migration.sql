/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Article` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Article` DROP FOREIGN KEY `Article_categoryId_fkey`;

-- DropIndex
DROP INDEX `Article_categoryId_idx` ON `Article`;

-- DropIndex
DROP INDEX `Article_slug_key` ON `Article`;

-- DropIndex
DROP INDEX `Article_type_idx` ON `Article`;

-- AlterTable
ALTER TABLE `Article` DROP COLUMN `categoryId`,
    DROP COLUMN `slug`,
    DROP COLUMN `type`;

-- AlterTable
ALTER TABLE `Category` ADD COLUMN `type` INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE `_ArticleCategories` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_ArticleCategories_AB_unique`(`A`, `B`),
    INDEX `_ArticleCategories_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_ArticleCategories` ADD CONSTRAINT `_ArticleCategories_A_fkey` FOREIGN KEY (`A`) REFERENCES `Article`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ArticleCategories` ADD CONSTRAINT `_ArticleCategories_B_fkey` FOREIGN KEY (`B`) REFERENCES `Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
