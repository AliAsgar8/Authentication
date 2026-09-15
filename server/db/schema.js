import {
  mysqlTable,
  int,
  varchar,
  boolean,
  timestamp,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  verifyOtp: varchar("verify_otp", { length: 10 }).default(""),
  verifyOtpExpireAt: timestamp("verify_otp_expire_at"),
  isAccountVerified: boolean("is_account_verified").default(false).notNull(),
  resetOtp: varchar("reset_otp", { length: 10 }).default(""),
  resetOtpExpireAt: timestamp("reset_otp_expire_at"),
});

export const posts = mysqlTable("posts", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 255 }).notNull(),
  content: varchar("content", { length: 1000 }).notNull(),
});
