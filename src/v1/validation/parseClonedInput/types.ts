import type {
  Attribute,
  AttributeBasicValue,
  AttributeValue,
  Extension,
  Item,
  RequiredOption,
} from 'v1/schema'
import type { If } from 'v1/types'

import type { HasExtension } from '../types'

export type ExtensionParser<
  INPUT_EXTENSION extends Extension,
  SCHEMA_EXTENSION extends Extension = INPUT_EXTENSION
> = (
  attribute: Attribute,
  input: AttributeValue<INPUT_EXTENSION> | undefined,
  options: ParsingOptions<INPUT_EXTENSION, SCHEMA_EXTENSION>,
) =>
  | {
      isExtension: true
      extensionParser: () => Generator<
        AttributeValue<INPUT_EXTENSION>,
        AttributeValue<INPUT_EXTENSION>
      >
      basicInput?: never
    }
  | {
      isExtension: false
      extensionParser?: never
      basicInput: AttributeBasicValue<INPUT_EXTENSION> | undefined
    }

export interface AttributeFilters {
  key?: boolean
}

export type OperationName = 'key' | 'put' | 'update'

export type ParsingOptions<
  INPUT_EXTENSION extends Extension,
  SCHEMA_EXTENSION extends Extension = INPUT_EXTENSION
> = {
  operationName?: OperationName
  requiringOptions?: Set<RequiredOption>
  filters?: AttributeFilters
  transform?: boolean
  schemaInput?: Item<SCHEMA_EXTENSION>
} & If<
  HasExtension<INPUT_EXTENSION>,
  { parseExtension: ExtensionParser<INPUT_EXTENSION, SCHEMA_EXTENSION> },
  { parseExtension?: never }
>
