CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`verify_otp` varchar(10) DEFAULT '',
	`verify_otp_expire_at` timestamp,
	`is_account_verified` boolean NOT NULL DEFAULT false,
	`reset_otp` varchar(10) DEFAULT '',
	`reset_otp_expire_at` timestamp,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
