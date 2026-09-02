ALTER TABLE `mensajes` ALTER COLUMN "creado_en" TO "creado_en" text NOT NULL DEFAULT '2026-09-02T00:39:44.061Z';--> statement-breakpoint
ALTER TABLE `mensajes` ADD `autor` text;