import { DynamoDBToolboxError } from 'v1/errors'
import { $REMOVE } from 'v1/operations/updateItem/constants'
import type { UpdateItemInputExtension } from 'v1/operations/updateItem/types'
import { hasGetOperation } from 'v1/operations/updateItem/utils'
import type { PrimitiveAttribute } from 'v1/schema'
import type { ExtensionParser } from 'v1/validation/parseClonedInput/types'

import { parseListExtension } from './list'
import { parseMapExtension } from './map'
import { parseNumberExtension } from './number'
import { parseRecordExtension } from './record'
import { parseReferenceExtension } from './reference'
import { parseSetExtension } from './set'

export const parseUpdateExtension: ExtensionParser<UpdateItemInputExtension> = (
  attribute,
  input,
  options,
) => {
  if (input === $REMOVE) {
    return {
      isExtension: true,
      *extensionParser() {
        const clonedValue: typeof $REMOVE = input
        yield clonedValue

        if (attribute.required !== 'never') {
          throw new DynamoDBToolboxError('parsing.attributeRequired', {
            message: `Attribute ${attribute.path} is required and cannot be removed`,
            path: attribute.path,
          })
        }

        const parsedValue: typeof $REMOVE = clonedValue
        yield parsedValue

        const collapsedValue: typeof $REMOVE = parsedValue
        return collapsedValue
      },
    }
  }

  /**
   * @debt refactor "Maybe we can simply parse a super-extension here, and continue if is(Super)Extension is false. Would be neat."
   */
  if (hasGetOperation(input)) {
    return parseReferenceExtension(attribute, input, {
      ...options,
      // Can be a reference
      parseExtension: parseReferenceExtension,
    })
  }

  switch (attribute.type) {
    case 'number':
      /**
       * @debt type "fix this cast"
       */
      return parseNumberExtension(
        attribute as PrimitiveAttribute<'number'>,
        input,
        options,
      )
    case 'set':
      return parseSetExtension(attribute, input, options)
    case 'list':
      return parseListExtension(attribute, input, options)
    case 'map':
      return parseMapExtension(attribute, input, options)
    case 'record':
      return parseRecordExtension(attribute, input, options)
    default:
      return { isExtension: false, basicInput: input }
  }
}
