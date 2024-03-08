import isEmpty from 'lodash.isempty'

import type { EntityV2 } from 'v1/entity'
import { EntityConditionParser } from 'v1/entity/actions/parseCondition'
import { rejectExtraOptions } from 'v1/options/rejectExtraOptions'

import { DeleteItemTransactionOptions } from '../options'
import type { TransactDeleteItemParams } from './transactDeleteItemParams'

type TransactionOptions = Omit<TransactDeleteItemParams, 'TableName' | 'Key'>

export const parseDeleteItemTransactionOptions = <ENTITY extends EntityV2>(
  entity: ENTITY,
  deleteItemTransactionOptions: DeleteItemTransactionOptions<ENTITY>
): TransactionOptions => {
  const transactionOptions: TransactionOptions = {}

  const { condition, ...extraOptions } = deleteItemTransactionOptions

  if (condition !== undefined) {
    const {
      ExpressionAttributeNames,
      ExpressionAttributeValues,
      ConditionExpression
    } = entity.build(EntityConditionParser).parse(condition).toCommandOptions()

    if (!isEmpty(ExpressionAttributeNames)) {
      transactionOptions.ExpressionAttributeNames = ExpressionAttributeNames
    }

    if (!isEmpty(ExpressionAttributeValues)) {
      transactionOptions.ExpressionAttributeValues = ExpressionAttributeValues
    }

    transactionOptions.ConditionExpression = ConditionExpression
  }

  rejectExtraOptions(extraOptions)

  return transactionOptions
}