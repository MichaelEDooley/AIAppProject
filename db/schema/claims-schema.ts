/**
 * @description
 * Claims management schema with status tracking and resolution analytics.
 * Links to both customers and policies for comprehensive tracking.
 *
 * Columns:
 * - resolutionTime: Calculated field for performance metrics
 * - statusHistory: JSON array of status changes with timestamps
 *
 * @enums
 * - claimStatus: Lifecycle states for insurance claims
 */

import {
  pgTable,
  uuid,
  text,
  timestamp,
  json,
  interval,
  pgEnum
} from "drizzle-orm/pg-core"
import { customersTable } from "./customers-schema"
import { policiesTable } from "./policies-schema"

export const claimStatusEnum = pgEnum("claim_status", [
  "OPEN",
  "IN_PROGRESS",
  "REQUIRES_INFO",
  "RESOLVED",
  "DENIED"
])

export const claimsTable = pgTable("claims", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id")
    .references(() => customersTable.id)
    .notNull(),
  policyId: uuid("policy_id")
    .references(() => policiesTable.id)
    .notNull(),
  claimDetails: json("claim_details").notNull(),
  status: claimStatusEnum("status").notNull().default("OPEN"),
  statusHistory: json("status_history").array().notNull().default([]),
  resolutionTime: interval("resolution_time"),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertClaim = typeof claimsTable.$inferInsert
export type SelectClaim = typeof claimsTable.$inferSelect
