CREATE TABLE `habilidades_secciones` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`orden` integer DEFAULT 0 NOT NULL,
	`creado_en` text DEFAULT '2026-09-13T00:45:54.218Z' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `habilidades_subsecciones` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`seccion_id` integer NOT NULL,
	`nombre` text NOT NULL,
	`orden` integer DEFAULT 0 NOT NULL,
	`creado_en` text DEFAULT '2026-09-13T00:45:54.218Z' NOT NULL,
	FOREIGN KEY (`seccion_id`) REFERENCES `habilidades_secciones`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `habilidades_tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`subseccion_id` integer NOT NULL,
	`nombre` text NOT NULL,
	`destacada` integer DEFAULT true NOT NULL,
	`orden` integer DEFAULT 0 NOT NULL,
	`creado_en` text DEFAULT '2026-09-13T00:45:54.218Z' NOT NULL,
	FOREIGN KEY (`subseccion_id`) REFERENCES `habilidades_subsecciones`(`id`) ON UPDATE no action ON DELETE cascade
);