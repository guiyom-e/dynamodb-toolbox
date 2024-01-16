import { $ADD, $DELETE } from 'v1/operations/updateItem/constants'
import type { UpdateItemInputExtension } from 'v1/operations/updateItem/types'
import {
  hasAddOperation,
  hasDeleteOperation,
} from 'v1/operations/updateItem/utils'
import type {
  AttributeBasicValue,
  AttributeValue,
  SetAttribute,
} from 'v1/schema'
import { parseAttributeClonedInput } from 'v1/validation/parseClonedInput/attribute'
import type {
  ExtensionParser,
  ParsingOptions,
} from 'v1/validation/parseClonedInput/types'

export const parseSetExtension = (
  attribute: SetAttribute,
  input: AttributeValue<UpdateItemInputExtension> | undefined,
  options: ParsingOptions<UpdateItemInputExtension>,
): ReturnType<ExtensionParser<UpdateItemInputExtension>> => {
  if (hasAddOperation(input)) {
    return {
      isExtension: true,
      *extensionParser() {
        const parser = parseAttributeClonedInput(attribute, input[$ADD], {
          ...options,
          // Should a simple set of valid elements (not extended)
          parseExtension: undefined,
        })

        const clonedValue = { [$ADD]: parser.next().value }
        yield clonedValue

        const parsedValue = { [$ADD]: parser.next().value }
        yield parsedValue

        const collapsedValue = { [$ADD]: parser.next().value }
        return collapsedValue
      },
    }
  }

  if (hasDeleteOperation(input)) {
    return {
      isExtension: true,
      *extensionParser() {
        const parser = parseAttributeClonedInput(attribute, input[$DELETE], {
          ...options,
          // Should a simple set of valid elements (not extended)
          parseExtension: undefined,
        })

        const clonedValue = { [$DELETE]: parser.next().value }
        yield clonedValue

        const parsedValue = { [$DELETE]: parser.next().value }
        yield parsedValue

        const collapsedValue = { [$DELETE]: parser.next().value }
        return collapsedValue
      },
    }
  }

  return {
    isExtension: false,
    basicInput: input as
      | AttributeBasicValue<UpdateItemInputExtension>
      | undefined,
  }
}
