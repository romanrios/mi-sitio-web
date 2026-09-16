CREATE TABLE `hero` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`imagen_url` text NOT NULL,
	`titulo` text NOT NULL,
	`subtitulo` text NOT NULL,
	`descripcion` text NOT NULL,
	`actualizado_en` text DEFAULT '2026-09-16T15:16:11.029Z' NOT NULL
);