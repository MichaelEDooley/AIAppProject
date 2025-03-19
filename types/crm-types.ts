/**
 * @description
 * Extended type definitions for CRM-specific server actions
 * Includes specialized error messages and data types
 */

import { SelectCustomer, SelectPolicy } from "@/db/schema"

export type CustomerActionState =
  | {
      isSuccess: true
      message: string
      data: SelectCustomer | SelectCustomer[]
    }
  | { isSuccess: false; message: string; data?: never }

export type PolicyActionState =
  | { isSuccess: true; message: string; data: SelectPolicy | SelectPolicy[] }
  | { isSuccess: false; message: string; data?: never }

export type CRMEntityType = "customer" | "policy" | "claim"
