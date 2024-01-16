import type { EntityV2 } from 'v1/entity'
import type { Item, RequiredOption } from 'v1/schema'
import { parseSchemaClonedInput } from 'v1/validation/parseClonedInput'

type EntityKeyInputParser = (
  entity: EntityV2,
  input: Item,
) => Generator<Item, Item>

const requiringOptions = new Set<RequiredOption>(['always'])

export const parseEntityKeyInput: EntityKeyInputParser = (entity, input) => {
  const parser = parseSchemaClonedInput(entity.schema, input, {
    operationName: 'key',
    requiringOptions,
    filters: { key: true },
  })

  parser.next() // cloned

  return parser
}
