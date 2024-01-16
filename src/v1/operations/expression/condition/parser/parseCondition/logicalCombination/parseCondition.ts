import type { Condition } from 'v1/operations/types'

import type { ConditionParser } from '../../parser'
import {
  isLogicalCombinationOperator,
  LogicalCombinationCondition,
  LogicalCombinationOperator,
} from './types'

const logicalCombinationOperatorExpression: Record<
  LogicalCombinationOperator,
  string
> = {
  or: 'OR',
  and: 'AND',
}

type AppendLogicalCombinationCondition = <
  CONDITION extends LogicalCombinationCondition
>(
  conditionParser: ConditionParser,
  condition: CONDITION,
) => void

export const parseLogicalCombinationCondition: AppendLogicalCombinationCondition = <
  CONDITION extends LogicalCombinationCondition
>(
  conditionParser: ConditionParser,
  condition: CONDITION,
): void => {
  const logicalCombinationOperator = Object.keys(condition).find(
    isLogicalCombinationOperator,
  ) as keyof CONDITION & LogicalCombinationOperator

  const childrenConditions = (condition[
    logicalCombinationOperator
  ] as unknown) as Condition[]
  const childrenConditionExpressions: string[] = []
  conditionParser.resetExpression()
  for (const childCondition of childrenConditions) {
    conditionParser.parseCondition(childCondition)
    childrenConditionExpressions.push(conditionParser.expression)
  }
  conditionParser.resetExpression(
    `(${childrenConditionExpressions.join(
      `) ${logicalCombinationOperatorExpression[logicalCombinationOperator]} (`,
    )})`,
  )
}
