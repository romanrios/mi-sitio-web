CREATE TABLE `mensajes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`contenido` text NOT NULL,
	`creado_en` text DEFAULT '2026-09-01T23:32:46.162Z' NOT NULL
);
