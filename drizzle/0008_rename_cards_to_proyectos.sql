ALTER TABLE `cards` RENAME TO `proyectos`;--> statement-breakpoint
ALTER TABLE `card_galeria` RENAME TO `proyecto_galeria`;--> statement-breakpoint
ALTER TABLE `card_tags` RENAME TO `proyecto_tags`;--> statement-breakpoint
ALTER TABLE `card_enlaces` RENAME TO `proyecto_enlaces`;--> statement-breakpoint
ALTER TABLE `proyecto_galeria` RENAME COLUMN `card_id` TO `proyecto_id`;--> statement-breakpoint
ALTER TABLE `proyecto_tags` RENAME COLUMN `card_id` TO `proyecto_id`;--> statement-breakpoint
ALTER TABLE `proyecto_enlaces` RENAME COLUMN `card_id` TO `proyecto_id`;
