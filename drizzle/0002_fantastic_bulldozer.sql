CREATE TABLE `cards` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`titulo` text NOT NULL,
	`descripcion` text NOT NULL,
	`imagen_url` text NOT NULL,
	`orden` integer DEFAULT 0 NOT NULL,
	`creado_en` text DEFAULT '2026-09-02T02:52:53.171Z' NOT NULL
);
--> statement-breakpoint
ALTER TABLE `mensajes` ALTER COLUMN "creado_en" TO "creado_en" text NOT NULL DEFAULT '2026-09-02T02:52:53.167Z';