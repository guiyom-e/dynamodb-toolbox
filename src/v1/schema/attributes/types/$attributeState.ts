import type { $AnyAttributeState } from '../any'
import type { $AnyOfAttributeState } from '../anyOf'
import type { $ListAttributeState } from '../list'
import type { $MapAttributeState } from '../map'
import type { $PrimitiveAttributeState } from '../primitive'
import type { $RecordAttributeState } from '../record'
import type { $SetAttributeState } from '../set'

/**
 * Any warm attribute state
 */
export type $AttributeState =
  | $AnyAttributeState
  | $PrimitiveAttributeState
  | $SetAttributeState
  | $ListAttributeState
  | $MapAttributeState
  | $RecordAttributeState
  | $AnyOfAttributeState

/**
 * Any warm schema attribute states
 */
export interface $SchemaAttributeStates {
  [key: string]: $AttributeState
}
