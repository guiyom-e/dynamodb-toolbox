import type { Attribute } from 'v1/schema'

import {
  AppendAttributePathOptions,
  isAttributePath,
} from '../../expressionParser'
import type { AppendAttributeValueOptions } from './appendAttributeValue'
import type { ConditionParser } from './parser'

export const appendAttributeValueOrPath = (
  conditionParser: ConditionParser,
  attribute: Attribute,
  expressionAttributeValueOrPath: unknown,
  options: AppendAttributeValueOptions & AppendAttributePathOptions = {},
): void => {
  if (isAttributePath(expressionAttributeValueOrPath)) {
    conditionParser.appendAttributePath(
      expressionAttributeValueOrPath.attr,
      options,
    )
  } else {
    conditionParser.appendAttributeValue(
      attribute,
      expressionAttributeValueOrPath,
      options,
    )
  }
}
