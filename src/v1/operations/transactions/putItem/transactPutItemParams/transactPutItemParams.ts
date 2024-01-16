import type { TransactWriteCommandInput } from '@aws-sdk/lib-dynamodb'

import type { EntityV2 } from 'v1/entity'
import { parsePrimaryKey } from 'v1/operations/utils/parsePrimaryKey'

import type { PutItemInput } from '../../../putItem'
import type { PutItemTransactionOptions } from '../options'
import { parsePutItemTransactionOptions } from './parsePutItemOptions'
import { parseEntityPutTransactionInput } from './parsePutTransactionInput'

export type TransactPutItemParams = NonNullable<
  NonNullable<TransactWriteCommandInput['TransactItems']>[number]['Put']
>

export const transactPutItemParams = <
  ENTITY extends EntityV2,
  OPTIONS extends PutItemTransactionOptions<ENTITY>
>(
  entity: ENTITY,
  input: PutItemInput<ENTITY>,
  putItemTransactionOptions: OPTIONS = {} as OPTIONS,
): TransactPutItemParams => {
  const validInputParser = parseEntityPutTransactionInput(entity, input)
  const validInput = validInputParser.next().value
  const collapsedInput = validInputParser.next().value

  const keyInput = entity.computeKey
    ? entity.computeKey(validInput)
    : collapsedInput
  const primaryKey = parsePrimaryKey(entity, keyInput)

  const options = parsePutItemTransactionOptions(
    entity,
    putItemTransactionOptions,
  )

  return {
    TableName: entity.table.getName(),
    Item: { ...collapsedInput, ...primaryKey },
    ...options,
  }
}
