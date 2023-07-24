import type { UpdateCommandInput } from '@aws-sdk/lib-dynamodb'

import type { EntityV2 } from 'v1/entity'
import { parsePrimaryKey } from 'v1/commands/utils/parsePrimaryKey'
import { renameSavedAsAttributes } from 'v1/commands/utils/renameSavedAsAttributes'

import type { UpdateItemInput } from '../types'
import type { UpdateItemOptions } from '../options'

import { parseEntityUpdateCommandInput } from './parseUpdateCommandInput'
import { parseUpdateItemOptions } from './parseUpdateItemOptions'

export const updateItemParams = <
  ENTITY extends EntityV2,
  OPTIONS extends UpdateItemOptions<ENTITY>
>(
  entity: ENTITY,
  input: UpdateItemInput<ENTITY, false>,
  updateItemOptions: OPTIONS = {} as OPTIONS
): UpdateCommandInput => {
  const validInput = parseEntityUpdateCommandInput(entity, input)
  const renamedInput = renameSavedAsAttributes(validInput)

  const keyInput = entity.computeKey ? entity.computeKey(validInput) : renamedInput
  const primaryKey = parsePrimaryKey(entity, keyInput)

  const options = parseUpdateItemOptions(entity, updateItemOptions)

  return {
    TableName: entity.table.name,
    Key: { ...primaryKey },
    // TODO
    UpdateExpression: '',
    ...options,
    ExpressionAttributeNames: {
      ...options.ExpressionAttributeNames
      // TODO
      // ...ExpressionAttributeNames
    },
    ExpressionAttributeValues: {
      ...options.ExpressionAttributeValues
      // TODO
      // ...ExpressionAttributeValues
    }
  }
}