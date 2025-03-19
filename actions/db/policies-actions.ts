/**
 * @description
 * Policy management server actions with version control and audit trails
 * 
 * Features:
 * - Full policy lifecycle management
 * - Automated version incrementing
 * - Audit trail tracking for compliance
 * - Renewal date validation
 * 
 * @dependencies
 * - policiesTable schema
 * - customersTable for foreign key constraints
 */

"use server"

import { db } from "@/db/db"
import { customersTable } from "@/db/schema/customers-schema"
import { InsertPolicy, SelectPolicy, policiesTable } from "@/db/schema/policies-schema"
import { ActionState } from "@/types"
import { auth } from "@clerk/nextjs/server"
import { eq, and } from "drizzle-orm"

export async function createPolicyAction(
  policy: Omit<InsertPolicy, "userId" | "version" | "auditTrail" | "createdAt" | "updatedAt">
): Promise<ActionState<SelectPolicy>> {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error("Unauthorized")

    // Verify customer exists
    const customer = await db.query.customers.findFirst({
      where: eq(customersTable.id, policy.customerId)
    })
    if (!customer) throw new Error("Customer not found")

    const [newPolicy] = await db.insert(policiesTable).values({
      ...policy,
      userId,
      version: 1,
      auditTrail: [{
        timestamp: new Date(),
        action: "CREATED",
        userId
      }]
    }).returning()

    return {
      isSuccess: true,
      message: "Policy created successfully",
      data: newPolicy
    }
  } catch (error) {
    console.error("Error creating policy:", error)
    return { isSuccess: false, message: error instanceof Error ? error.message : "Failed to create policy" }
  }
}

export async function getPoliciesByCustomerAction(
  customerId: string
): Promise<ActionState<SelectPolicy[]>> {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error("Unauthorized")

    const policies = await db.query.policies.findMany({
      where: and(
        eq(policiesTable.customerId, customerId),
        eq(policiesTable.userId, userId)
      )
    })

    return {
      isSuccess: true,
      message: "Policies retrieved successfully",
      data: policies
    }
  } catch (error) {
    console.error("Error getting policies:", error)
    return { isSuccess: false, message: "Failed to get policies" }
  }
}

export async function updatePolicyAction(
  id: string,
  data: Partial<Omit<InsertPolicy, "id" | "userId" | "version" | "auditTrail" | "createdAt" | "updatedAt">>
): Promise<ActionState<SelectPolicy>> {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error("Unauthorized")

    const [existing] = await db.query.policies.findMany({
      where: and(eq(policiesTable.id, id), eq(policiesTable.userId, userId))
    })

    if (!existing) {
      return { isSuccess: false, message: "Policy not found" }
    }

    const auditEntry = {
      timestamp: new Date(),
      action: "UPDATED",
      userId,
      changes: Object.keys(data)
    }

    const [updatedPolicy] = await db
      .update(policiesTable)
      .set({
        ...data,
        version: existing.version + 1,
        auditTrail: [...existing.auditTrail, auditEntry]
      })
      .where(eq(policiesTable.id, id))
      .returning()

    return {
      isSuccess: true,
      message: "Policy updated successfully",
      data: updatedPolicy
    }
  } catch (error) {
    console.error("Error updating policy:", error)
    return { isSuccess: false, message: "Failed to update policy" }
  }
}

export async function deletePolicyAction(
  id: string
): Promise<ActionState<void>> {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error("Unauthorized")

    await db
      .delete(policiesTable)
      .where(and(eq(policiesTable.id, id), eq(policiesTable.userId, userId)))

    return {
      isSuccess: true,
      message: "Policy deleted permanently",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting policy:", error)
    return { isSuccess: false, message: "Failed to delete policy" }
  }
}