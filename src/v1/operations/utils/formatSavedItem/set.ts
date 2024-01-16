import { DynamoDBToolboxError } from 'v1/errors'
import type { AttributeValue, SetAttribute, SetAttributeValue } from 'v1/schema'
import { isSet } from 'v1/utils/validation'

import { formatSavedAttribute } from './attribute'
import type { FormatSavedAttributeOptions } from './types'
import { getItemKey } from './utils'

export const formatSavedSetAttribute = (
  setAttribute: SetAttribute,
  savedValue: AttributeValue,
  options: FormatSavedAttributeOptions = {},
): SetAttributeValue => {
  if (!isSet(savedValue)) {
    const { partitionKey, sortKey } = options

    throw new DynamoDBToolboxError(
      'operations.formatSavedItem.invalidSavedAttribute',
      {
        message: [
          `Invalid attribute in saved item: ${setAttribute.path}. Should be a ${setAttribute.type}.`,
          getItemKey({ partitionKey, sortKey }),
        ]
          .filter(Boolean)
          .join(' '),
        path: setAttribute.path,
        payload: {
          received: savedValue,
          expected: setAttribute.type,
          partitionKey,
          sortKey,
        },
      },
    )
  }

  const parsedPutItemInput: SetAttributeValue = new Set()

  for (const savedElement of savedValue) {
    const parsedElement = formatSavedAttribute(
      setAttribute.elements,
      savedElement,
      options,
    )

    if (parsedElement !== undefined) {
      parsedPutItemInput.add(parsedElement)
    }
  }

  return parsedPutItemInput
}
