CREATE TABLE `experiencias` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tipo` text NOT NULL,
	`titulo` text NOT NULL,
	`descripcion` text,
	`fecha_inicio` text NOT NULL,
	`fecha_fin` text,
	`actualmente` integer DEFAULT false NOT NULL,
	`creado_en` text DEFAULT '2026-09-11T16:45:29.201Z' NOT NULL,
	`actualizado_en` text DEFAULT '2026-09-11T16:45:29.201Z' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `experiencias_posiciones` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`experiencia_id` integer NOT NULL,
	`titulo` text NOT NULL,
	`fecha_inicio` text NOT NULL,
	`fecha_fin` text,
	`actualmente` integer DEFAULT false NOT NULL,
	`creado_en` text DEFAULT '2026-09-11T16:45:29.202Z' NOT NULL,
	FOREIGN KEY (`experiencia_id`) REFERENCES `experiencias`(`id`) ON UPDATE no action ON DELETE cascade
);