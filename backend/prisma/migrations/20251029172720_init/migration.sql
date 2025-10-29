-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `githubId` INTEGER NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `avatarUrl` TEXT NULL,
    `accessToken` TEXT NOT NULL,
    `refreshToken` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_githubId_key`(`githubId`),
    UNIQUE INDEX `User_username_key`(`username`),
    INDEX `User_githubId_idx`(`githubId`),
    INDEX `User_username_idx`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `token` VARCHAR(500) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Session_token_key`(`token`),
    INDEX `Session_userId_idx`(`userId`),
    INDEX `Session_token_idx`(`token`),
    INDEX `Session_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Repository` (
    `id` VARCHAR(191) NOT NULL,
    `githubId` INTEGER NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `fullName` VARCHAR(255) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `language` VARCHAR(100) NULL,
    `stars` INTEGER NOT NULL DEFAULT 0,
    `forks` INTEGER NOT NULL DEFAULT 0,
    `isPrivate` BOOLEAN NOT NULL DEFAULT false,
    `lastSyncedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Repository_githubId_key`(`githubId`),
    INDEX `Repository_ownerId_idx`(`ownerId`),
    INDEX `Repository_lastSyncedAt_idx`(`lastSyncedAt`),
    INDEX `Repository_githubId_idx`(`githubId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Commit` (
    `id` VARCHAR(191) NOT NULL,
    `sha` VARCHAR(40) NOT NULL,
    `repositoryId` VARCHAR(191) NOT NULL,
    `author` VARCHAR(255) NOT NULL,
    `authorEmail` VARCHAR(255) NULL,
    `message` TEXT NOT NULL,
    `additions` INTEGER NOT NULL DEFAULT 0,
    `deletions` INTEGER NOT NULL DEFAULT 0,
    `committedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Commit_sha_key`(`sha`),
    INDEX `Commit_repositoryId_idx`(`repositoryId`),
    INDEX `Commit_author_idx`(`author`),
    INDEX `Commit_sha_idx`(`sha`),
    INDEX `Commit_committedAt_idx`(`committedAt`),
    INDEX `Commit_repositoryId_committedAt_idx`(`repositoryId`, `committedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AnalyticsCache` (
    `id` VARCHAR(191) NOT NULL,
    `repositoryId` VARCHAR(255) NOT NULL,
    `metricType` VARCHAR(100) NOT NULL,
    `dateRange` VARCHAR(20) NOT NULL,
    `data` JSON NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AnalyticsCache_expiresAt_idx`(`expiresAt`),
    INDEX `AnalyticsCache_repositoryId_idx`(`repositoryId`),
    UNIQUE INDEX `AnalyticsCache_repositoryId_metricType_dateRange_key`(`repositoryId`, `metricType`, `dateRange`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
