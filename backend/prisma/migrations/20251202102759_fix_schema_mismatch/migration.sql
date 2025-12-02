ALTER TABLE `Repository` ADD COLUMN `isFavorite` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `license` VARCHAR(100) NULL,
    ADD COLUMN `openIssues` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `size` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `topics` JSON NULL,
    ADD COLUMN `watchers` INTEGER NOT NULL DEFAULT 0;

CREATE INDEX `Repository_isFavorite_idx` ON `Repository`(`isFavorite`);
