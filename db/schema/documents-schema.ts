/**
 * @description
 * Document storage schema with version control and GDPR-compliant retention policies.
 * Integrates with Supabase Storage for actual file storage.
 *
 * Columns:
 * - storagePath: Full path in Supabase Storage bucket
 * - documentType: Classification for different document categories
 * - version: Incremental version number for updates
 *
 * @enums
 * - documentType: Common insurance document classifications
 */

import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  pgEnum
} from "drizzle-orm/pg-core"
import { customersTable } from "./customers-schema"
import { policiesTable } from "./policies-schema"

export const documentTypeEnum = pgEnum("document_type", [
  "POLICY",
  "CLAIM",
  "IDENTIFICATION",
  "CONTRACT",
  "OTHER"
])

export const documentsTable = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  storagePath: text("storage_path").notNull(),
  documentType: documentTypeEnum("document_type").notNull().default("OTHER"),
  customerId: uuid("customer_id").references(() => customersTable.id),
  policyId: uuid("policy_id").references(() => policiesTable.id),
  version: integer("version").notNull().default(1),
  userId: text("user_id").notNull(),
  bucketName: text("bucket_name")
    .notNull()
    .default(process.env.SUPABASE_DOCUMENTS_BUCKET!),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertDocument = typeof documentsTable.$inferInsert
export type SelectDocument = typeof documentsTable.$inferSelect
