import { createInsertSchema } from "drizzle-zod";
import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  priceCents: integer("price_cents").notNull(),
  imageUrl: text("image_url").notNull().default(""),
  category: text("category").notNull().default("Cuidados capilares"),
  isActive: boolean("is_active").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const storeSettingsTable = pgTable("store_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Product = typeof productsTable.$inferSelect;
export type NewProduct = typeof productsTable.$inferInsert;
