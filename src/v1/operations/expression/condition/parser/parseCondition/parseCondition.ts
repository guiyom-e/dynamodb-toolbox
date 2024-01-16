import { DynamoDBToolboxError } from 'v1/errors'
import type { Condition } from 'v1/operations/types'

import type { ConditionParser } from '../parser'
import { isBetweenCondition, parseBetweenCondition } from './between'
import { isComparisonCondition, parseComparisonCondition } from './comparison'
import { isInCondition, parseInCondition } from './in'
import {
  isLogicalCombinationCondition,
  parseLogicalCombinationCondition,
} from './logicalCombination'
import { isNotCondition, parseNotCondition } from './not'
import {
  isSingleArgFnCondition,
  parseSingleArgFnCondition,
} from './singleArgFn'
import { isTwoArgsFnCondition, parseTwoArgsFnCondition } from './twoArgsFn'

export const parseCondition = (
  conditionParser: ConditionParser,
  condition: Condition,
): void => {
  if (isComparisonCondition(condition)) {
    return parseComparisonCondition(conditionParser, condition)
  }

  if (isSingleArgFnCondition(condition)) {
    return parseSingleArgFnCondition(conditionParser, condition)
  }

  if (isBetweenCondition(condition)) {
    return parseBetweenCondition(conditionParser, condition)
  }

  if (isNotCondition(condition)) {
    return parseNotCondition(conditionParser, condition)
  }

  if (isLogicalCombinationCondition(condition)) {
    return parseLogicalCombinationCondition(conditionParser, condition)
  }

  if (isTwoArgsFnCondition(condition)) {
    return parseTwoArgsFnCondition(conditionParser, condition)
  }

  if (isInCondition(condition)) {
    return parseInCondition(conditionParser, condition)
  }

  throw new DynamoDBToolboxError('operations.invalidCondition', {
    message: 'Invalid condition: Unable to detect valid condition type.',
  })
}
