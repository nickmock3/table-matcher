import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

const nowEpoch = () => Math.floor(Date.now() / 1000);
const nowDate = () => new Date();

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(nowDate),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(nowDate),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(nowDate),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(nowDate),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp_ms" }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp_ms" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(nowDate),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(nowDate),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).$defaultFn(nowDate),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).$defaultFn(nowDate),
});

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("shop"),
  createdAt: integer("created_at", { mode: "number" }).notNull().$defaultFn(nowEpoch),
  updatedAt: integer("updated_at", { mode: "number" }).notNull().$defaultFn(nowEpoch),
});

export const stores = sqliteTable("stores", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address"),
  city: text("city").notNull(),
  genre: text("genre").notNull(),
  latitude: real("latitude"),
  longitude: real("longitude"),
  imageUrls: text("image_urls"),
  reservationUrl: text("reservation_url").notNull(),
  isPublished: integer("is_published", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "number" }).notNull().$defaultFn(nowEpoch),
  updatedAt: integer("updated_at", { mode: "number" }).notNull().$defaultFn(nowEpoch),
});

export const storeUserLinks = sqliteTable("store_user_links", {
  id: text("id").primaryKey(),
  storeId: text("store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  loginEmail: text("login_email").notNull(),
  createdAt: integer("created_at", { mode: "number" }).notNull().$defaultFn(nowEpoch),
  updatedAt: integer("updated_at", { mode: "number" }).notNull().$defaultFn(nowEpoch),
});

export const seatStatusUpdates = sqliteTable("seat_status_updates", {
  id: text("id").primaryKey(),
  storeId: text("store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),
  status: text("status", { enum: ["available", "unavailable"] }).notNull(),
  expiresAt: integer("expires_at", { mode: "number" }).notNull(),
  updatedByUserId: text("updated_by_user_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: integer("created_at", { mode: "number" }).notNull().$defaultFn(nowEpoch),
});

export const schema = {
  user,
  session,
  account,
  verification,
  users,
  stores,
  storeUserLinks,
  seatStatusUpdates,
};
