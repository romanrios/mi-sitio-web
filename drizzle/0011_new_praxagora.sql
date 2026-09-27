CREATE TABLE IF NOT EXISTS `proyecto_categorias` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL UNIQUE,
	`orden` integer DEFAULT 0 NOT NULL,
	`creado_en` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
INSERT OR IGNORE INTO `proyecto_categorias` (`id`, `nombre`, `orden`, `creado_en`) VALUES
(1, 'Desarrollo web y software', 0, CURRENT_TIMESTAMP),
(2, 'Desarrollo de videojuegos', 1, CURRENT_TIMESTAMP),
(3, 'Diseño y comunicación', 2, CURRENT_TIMESTAMP);