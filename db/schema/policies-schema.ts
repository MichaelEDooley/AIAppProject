/**
 * @description
 * Schema for insurance policy management with version history and renewal automation.
 * Maintains relationships with customers and documents.
 *
 * Columns:
 * - policyType: Specific insurance product type
 * - auditTrail: JSON array tracking all policy changes
 * - version: Incremental version number for concurrency control
 * - renewalDate: Next policy renewal target date
 *
 * @enums
 * - policyType: Common insurance product categories
 * - policyStatus: Lifecycle states for policies
 */

import {
  pgTable,
  uuid,
  text,
  timestamp,
  json,
  integer,
  numeric,
  pgEnum
} from "drizzle-orm/pg-core"
import { customersTable } from "./customers-schema"

export const policyTypeEnum = pgEnum("policy_type", [
  "AUTO",
  "HOME",
  "LIFE",
  "HEALTH",
  "OTHER"
])

export const policyStatusEnum = pgEnum("policy_status", [
  "ACTIVE",
  "PENDING",
  "EXPIRED",
  "CANCELLED"
])

export const policiesTable = pgTable("policies", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id")
    .references(() => customersTable.id)
    .notNull(),
  policyNumber: text("policy_number").notNull(),
  policyType: policyTypeEnum("policy_type").notNull(),
  premiumAmount: numeric("premium_amount", {
    precision: 15,
    scale: 2
  }).notNull(),
  renewalDate: timestamp("renewal_date").notNull(),
  status: policyStatusEnum("status").notNull().default("ACTIVE"),
  version: integer("version").notNull().default(1),
  auditTrail: json("audit_trail").array().notNull().default([]),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertPolicy = typeof policiesTable.$inferInsert
export type SelectPolicy = typeof policiesTable.$inferSelect
