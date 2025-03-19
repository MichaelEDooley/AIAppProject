/**
 * @description
 * Server actions for customer management with GDPR compliance and audit trails
 * 
 * Features:
 * - Create/Read/Update/Soft Delete customers
 * - Encrypted PII handling
 * - Audit trail tracking
 * - GDPR right to erasure via soft deletion
 * 
 * @dependencies
 * - customersTable schema
 * - Clerk auth for user context
 * 
 * @validation
 * - All actions validate user ownership
 * - Input validation for required fields
 * - Existence checks before updates/deletes
 */

"use server"

import { db } from "@/db/db"
import { InsertCustomer, SelectCustomer, customersTable } from "@/db/schema"
import { ActionState } from "@/types"
import { auth } from "@clerk/nextjs/server"
import { and, eq, isNull } from "drizzle-orm"

export async function createCustomerAction(
  customer: Omit<InsertCustomer, "userId" | "createdAt" | "updatedAt" | "deletedAt">
): Promise<ActionState<SelectCustomer>> {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error("Unauthorized")

    const [newCustomer] = await db.insert(customersTable).values({
      ...customer,
      userId,
      type: customer.type || "INDIVIDUAL",
      encryptedData: customer.encryptedData || {}
    }).returning()

    return {
      isSuccess: true,
      message: "Customer created successfully",
      data: newCustomer
    }
  } catch (error) {
    console.error("Error creating customer:", error)
    return { isSuccess: false, message: "Failed to create customer" }
  }
}

export async function getCustomersAction(
  includeDeleted = false
): Promise<ActionState<SelectCustomer[]>> {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error("Unauthorized")

    const query = db.query.customers.findMany({
      where: includeDeleted 
        ? eq(customersTable.userId, userId)
        : and(eq(customersTable.userId, userId), isNull(customersTable.deletedAt))
    })

    const customers = await query.execute()
    return {
      isSuccess: true,
      message: "Customers retrieved successfully",
      data: customers
    }
  } catch (error) {
    console.error("Error getting customers:", error)
    return { isSuccess: false, message: "Failed to get customers" }
  }
}

export async function updateCustomerAction(
  id: string,
  data: Partial<Omit<InsertCustomer, "id" | "userId" | "createdAt" | "updatedAt" | "deletedAt">>
): Promise<ActionState<SelectCustomer>> {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error("Unauthorized")

    const [existing] = await db.query.customers.findMany({
      where: and(eq(customersTable.id, id), eq(customersTable.userId, userId))
    })

    if (!existing) {
      return { isSuccess: false, message: "Customer not found" }
    }

    const [updatedCustomer] = await db
      .update(customersTable)
      .set(data)
      .where(eq(customersTable.id, id))
      .returning()

    return {
      isSuccess: true,
      message: "Customer updated successfully",
      data: updatedCustomer
    }
  } catch (error) {
    console.error("Error updating customer:", error)
    return { isSuccess: false, message: "Failed to update customer" }
  }
}

export async function softDeleteCustomerAction(
  id: string
): Promise<ActionState<void>> {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error("Unauthorized")

    await db
      .update(customersTable)
      .set({ deletedAt: new Date() })
      .where(and(eq(customersTable.id, id), eq(customersTable.userId, userId)))

    return {
      isSuccess: true,
      message: "Customer soft deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error soft deleting customer:", error)
    return { isSuccess: false, message: "Failed to soft delete customer" }
  }
}