CREATE TABLE IF NOT EXISTS `configuracion` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tema_default` text DEFAULT 'dark' NOT NULL,
	`actualizado_en` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);