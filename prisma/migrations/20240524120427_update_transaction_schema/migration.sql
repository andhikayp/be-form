/*
  Warnings:

  - You are about to drop the column `totalAmount` on the `group_transfers` table. All the data in the column will be lost.
  - You are about to drop the column `totalRecord` on the `group_transfers` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `instructionType` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `makerUserId` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `sourceAccount` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `transferTime` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `transferType` on the `transactions` table. All the data in the column will be lost.
  - Added the required column `instructionType` to the `group_transfers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transferType` to the `group_transfers` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `transactions` DROP FOREIGN KEY `transactions_makerUserId_fkey`;

-- AlterTable
ALTER TABLE `group_transfers` DROP COLUMN `totalAmount`,
    DROP COLUMN `totalRecord`,
    ADD COLUMN `instructionType` VARCHAR(20) NOT NULL,
    ADD COLUMN `transferDate` DATETIME(3) NULL,
    ADD COLUMN `transferTime` DATETIME(3) NULL,
    ADD COLUMN `transferType` VARCHAR(20) NOT NULL;

-- AlterTable
ALTER TABLE `transactions` DROP COLUMN `date`,
    DROP COLUMN `instructionType`,
    DROP COLUMN `makerUserId`,
    DROP COLUMN `sourceAccount`,
    DROP COLUMN `transferTime`,
    DROP COLUMN `transferType`;
