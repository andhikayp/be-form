-- CreateTable
CREATE TABLE `corporates` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `corporateAccountNumber` VARCHAR(12) NOT NULL,
    `corporateName` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `userId` VARCHAR(30) NOT NULL,
    `username` VARCHAR(100) NOT NULL,
    `corporateId` INTEGER NOT NULL,
    `role` VARCHAR(20) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `phoneNumber` VARCHAR(15) NOT NULL,
    `password` VARCHAR(100) NOT NULL,
    `verificationCode` VARCHAR(6) NULL,
    `token` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_userId_key`(`userId`),
    UNIQUE INDEX `users_token_key`(`token`),
    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `group_transfers` (
    `referenceNumber` VARCHAR(191) NOT NULL,
    `totalAmount` INTEGER NULL,
    `totalRecord` INTEGER NULL,
    `sourceAccount` VARCHAR(12) NOT NULL,
    `makerUserId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(15) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`referenceNumber`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transactions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `amount` INTEGER NOT NULL,
    `groupTransferId` VARCHAR(191) NOT NULL,
    `sourceAccount` VARCHAR(12) NULL,
    `destinationAccount` VARCHAR(12) NOT NULL,
    `destinationBankName` VARCHAR(50) NOT NULL,
    `destinationAccountName` VARCHAR(100) NOT NULL,
    `date` DATETIME(3) NULL,
    `transferTime` DATETIME(3) NULL,
    `makerUserId` VARCHAR(191) NOT NULL,
    `instructionType` VARCHAR(20) NOT NULL,
    `transferType` VARCHAR(20) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_corporateId_fkey` FOREIGN KEY (`corporateId`) REFERENCES `corporates`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `group_transfers` ADD CONSTRAINT `group_transfers_makerUserId_fkey` FOREIGN KEY (`makerUserId`) REFERENCES `users`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_makerUserId_fkey` FOREIGN KEY (`makerUserId`) REFERENCES `users`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_groupTransferId_fkey` FOREIGN KEY (`groupTransferId`) REFERENCES `group_transfers`(`referenceNumber`) ON DELETE RESTRICT ON UPDATE CASCADE;
