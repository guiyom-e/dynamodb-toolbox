import type {
  AnyAttributeCondition,
  Condition,
  NonLogicalCondition,
} from 'v1/operations/types'

export type InCondition = NonLogicalCondition &
  Extract<AnyAttributeCondition<string, string>, { in: unknown }>

export const isInCondition = (condition: Condition): condition is InCondition =>
  'in' in condition
