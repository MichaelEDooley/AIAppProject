/*
Initializes the database connection and schema for the app.
*/

import { profilesTable } from "@/db/schema"
import { config } from "dotenv"

config({ path: ".env.local" })

/**
 * @description
 * Main database configuration file that aggregates all CRM schemas.
 * Required for Drizzle ORM to generate proper migrations and queries.
 */

import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { customersTable } from "./schema/customers-schema"
import { policiesTable } from "./schema/policies-schema"
import { claimsTable } from "./schema/claims-schema"
import { documentsTable } from "./schema/documents-schema"

const connectionString = process.env.DATABASE_URL!
const client = postgres(connectionString)
const schema = {
  customers: customersTable,
  policies: policiesTable,
  claims: claimsTable,
  documents: documentsTable
}

export const db = drizzle(client, { schema })
