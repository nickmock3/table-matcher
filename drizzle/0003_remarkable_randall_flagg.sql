CREATE TABLE `page_view_events` (
	`id` text PRIMARY KEY NOT NULL,
	`store_id` text,
	`path` text NOT NULL,
	`anon_id` text NOT NULL,
	`session_id` text NOT NULL,
	`occurred_at` integer NOT NULL,
	`dedupe_key` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `page_view_events_dedupe_key_unique` ON `page_view_events` (`dedupe_key`);