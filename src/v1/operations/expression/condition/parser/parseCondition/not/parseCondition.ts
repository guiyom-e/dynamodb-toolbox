import type { ConditionParser } from '../../parser'
import type { NotCondition } from './types'

export const parseNotCondition = (
  conditionParser: ConditionParser,
  condition: NotCondition,
): void => {
  const { not: negatedCondition } = condition

  conditionParser.resetExpression()
  conditionParser.parseCondition(negatedCondition)
  conditionParser.resetExpression(`NOT (${conditionParser.expression})`)
}
