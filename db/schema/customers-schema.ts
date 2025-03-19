/**
 * @description
 * Defines the database schema for customer management with GDPR compliance.
 * Includes encrypted PII storage, soft deletion, and tagging capabilities.
 *
 * Columns:
 * - encryptedData: Stores all personally identifiable information encrypted
 * - tags: Array of customer categorization tags
 * - deletedAt: Timestamp for GDPR-compliant soft deletion
 * - Relationships: Links to policies and claims tables
 *
 * @enums
 * - customerType: Individual vs business customer differentiation
 *
 * @compliance
 * - GDPR Article 17: Right to erasure via soft delete pattern
 * - Audit trails maintained in related tables
 */

import {
  pgTable,
  uuid,
  text,
  timestamp,
  json,
  pgEnum
} from "drizzle-orm/pg-core"

export const customerTypeEnum = pgEnum("customer_type", [
  "INDIVIDUAL",
  "BUSINESS"
])

export const customersTable = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  encryptedData: json("encrypted_data").notNull(),
  tags: text("tags").array(),
  type: customerTypeEnum("type").notNull().default("INDIVIDUAL"),
  deletedAt: timestamp("deleted_at"),
  userId: text("user_id").notNull(), // Clerk user ID
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertCustomer = typeof customersTable.$inferInsert
export type SelectCustomer = typeof customersTable.$inferSelect
