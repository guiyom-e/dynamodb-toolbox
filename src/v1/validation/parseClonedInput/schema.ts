import cloneDeep from 'lodash.clonedeep'

import { DynamoDBToolboxError } from 'v1/errors'
import type { AttributeValue, Extension, Item, Schema } from 'v1/schema'
import type { If } from 'v1/types'
import { isObject } from 'v1/utils/validation/isObject'

import type { HasExtension } from '../types'
import { parseAttributeClonedInput } from './attribute'
import { doesAttributeMatchFilters } from './doesAttributeMatchFilter'
import type { ParsingOptions } from './types'

export function* parseSchemaClonedInput<
  SCHEMA_EXTENSION extends Extension = never
>(
  schema: Schema,
  inputValue: Item<SCHEMA_EXTENSION>,
  ...[options = {} as ParsingOptions<SCHEMA_EXTENSION, SCHEMA_EXTENSION>]: If<
    HasExtension<SCHEMA_EXTENSION>,
    [options: ParsingOptions<SCHEMA_EXTENSION, SCHEMA_EXTENSION>],
    [options?: ParsingOptions<SCHEMA_EXTENSION, SCHEMA_EXTENSION>]
  >
): Generator<Item<SCHEMA_EXTENSION>, Item<SCHEMA_EXTENSION>> {
  const { filters } = options
  const parsers: Record<
    string,
    Generator<AttributeValue<SCHEMA_EXTENSION>>
  > = {}
  let additionalAttributeNames: Set<string> = new Set()

  const isInputValueObject = isObject(inputValue)
  if (isInputValueObject) {
    additionalAttributeNames = new Set(Object.keys(inputValue))

    Object.entries(schema.attributes)
      .filter(([, attribute]) => doesAttributeMatchFilters(attribute, filters))
      .forEach(([attributeName, attribute]) => {
        parsers[attributeName] = parseAttributeClonedInput(
          attribute,
          inputValue[attributeName],
          {
            ...options,
            schemaInput: inputValue,
          },
        )

        additionalAttributeNames.delete(attributeName)
      })
  }

  const clonedValue = isInputValueObject
    ? {
        ...Object.fromEntries(
          [...additionalAttributeNames.values()].map(attributeName => {
            const additionalAttribute = schema.attributes[attributeName]

            const clonedAttributeValue =
              additionalAttribute !== undefined
                ? parseAttributeClonedInput(
                    additionalAttribute,
                    inputValue[attributeName],
                    options,
                  ).next().value
                : cloneDeep(inputValue[attributeName])

            return [attributeName, clonedAttributeValue]
          }),
        ),
        ...Object.fromEntries(
          Object.entries(parsers)
            .map(([attributeName, attribute]) => [
              attributeName,
              attribute.next().value,
            ])
            .filter(([, attributeValue]) => attributeValue !== undefined),
        ),
      }
    : cloneDeep(inputValue)
  yield clonedValue

  if (!isInputValueObject) {
    throw new DynamoDBToolboxError('parsing.invalidItem', {
      message: 'Items should be objects',
      payload: {
        received: inputValue,
        expected: 'object',
      },
    })
  }

  const parsedValue = Object.fromEntries(
    Object.entries(parsers)
      .map(([attributeName, attribute]) => [
        attributeName,
        attribute.next().value,
      ])
      .filter(([, attributeValue]) => attributeValue !== undefined),
  )
  yield parsedValue

  const collapsedValue = Object.fromEntries(
    Object.entries(parsers)
      .map(([attributeName, attribute]) => [
        schema.attributes[attributeName].savedAs ?? attributeName,
        attribute.next().value,
      ])
      .filter(([, attributeValue]) => attributeValue !== undefined),
  )
  return collapsedValue
}
