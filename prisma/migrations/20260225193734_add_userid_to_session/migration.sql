/*
  Warnings:

  - You are about to drop the column `expires_at` on the `session` table. All the data in the column will be lost.
  - Added the required column `expiresAt` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `session` DROP FOREIGN KEY `Session_user_id_fkey`;

-- DropIndex
DROP INDEX `Session_user_id_fkey` ON `session`;

-- AlterTable
ALTER TABLE `session` DROP COLUMN `expires_at`,
    ADD COLUMN `expiresAt` DATETIME(3) NOT NULL,
    MODIFY `user_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
