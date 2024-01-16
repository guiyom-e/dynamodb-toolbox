import {
  PutCommand,
  PutCommandInput,
  PutCommandOutput,
} from '@aws-sdk/lib-dynamodb'
import type { O } from 'ts-toolbelt'

import type { EntityV2, FormattedItem } from 'v1/entity'
import { DynamoDBToolboxError } from 'v1/errors'
import type {
  AllNewReturnValuesOption,
  AllOldReturnValuesOption,
  NoneReturnValuesOption,
  UpdatedNewReturnValuesOption,
  UpdatedOldReturnValuesOption,
} from 'v1/operations/constants/options/returnValues'
import { formatSavedItem } from 'v1/operations/utils/formatSavedItem'

import { $entity, EntityOperation } from '../class'
import type {
  PutItemCommandReturnValuesOption,
  PutItemOptions,
} from './options'
import { putItemParams } from './putItemParams'
import type { PutItemInput } from './types'

export const $item = Symbol('$item')
export type $item = typeof $item

export const $options = Symbol('$options')
export type $options = typeof $options

type ReturnedAttributes<
  ENTITY extends EntityV2,
  OPTIONS extends PutItemOptions<ENTITY>
> = PutItemCommandReturnValuesOption extends OPTIONS['returnValues']
  ? undefined
  : OPTIONS['returnValues'] extends NoneReturnValuesOption
  ? undefined
  : OPTIONS['returnValues'] extends
      | UpdatedOldReturnValuesOption
      | UpdatedNewReturnValuesOption
  ?
      | FormattedItem<
          ENTITY,
          {
            partial: OPTIONS['returnValues'] extends
              | UpdatedOldReturnValuesOption
              | UpdatedNewReturnValuesOption
              ? true
              : false
          }
        >
      | undefined
  : OPTIONS['returnValues'] extends
      | AllNewReturnValuesOption
      | AllOldReturnValuesOption
  ? FormattedItem<ENTITY> | undefined
  : never

export type PutItemResponse<
  ENTITY extends EntityV2,
  OPTIONS extends PutItemOptions<ENTITY> = PutItemOptions<ENTITY>
> = O.Merge<
  Omit<PutCommandOutput, 'Attributes'>,
  { Attributes?: ReturnedAttributes<ENTITY, OPTIONS> }
>

export class PutItemCommand<
  ENTITY extends EntityV2 = EntityV2,
  OPTIONS extends PutItemOptions<ENTITY> = PutItemOptions<ENTITY>
> extends EntityOperation<ENTITY> {
  static operationName = 'put' as const;

  [$item]?: PutItemInput<ENTITY>
  item: (nextItem: PutItemInput<ENTITY>) => PutItemCommand<ENTITY, OPTIONS>;
  [$options]: OPTIONS
  options: <NEXT_OPTIONS extends PutItemOptions<ENTITY>>(
    nextOptions: NEXT_OPTIONS,
  ) => PutItemCommand<ENTITY, NEXT_OPTIONS>

  constructor(
    entity: ENTITY,
    item?: PutItemInput<ENTITY>,
    options: OPTIONS = {} as OPTIONS,
  ) {
    super(entity)
    this[$item] = item
    this[$options] = options

    this.item = nextItem =>
      new PutItemCommand(this[$entity], nextItem, this[$options])
    this.options = nextOptions =>
      new PutItemCommand(this[$entity], this[$item], nextOptions)
  }

  params = (): PutCommandInput => {
    if (!this[$item]) {
      throw new DynamoDBToolboxError('operations.incompleteCommand', {
        message: 'PutItemCommand incomplete: Missing "item" property',
      })
    }

    return putItemParams(this[$entity], this[$item], this[$options])
  }

  send = async (): Promise<PutItemResponse<ENTITY, OPTIONS>> => {
    const putItemParams = this.params()

    const commandOutput = await this[$entity].table.documentClient.send(
      new PutCommand(putItemParams),
    )

    const { Attributes: attributes, ...restCommandOutput } = commandOutput

    if (attributes === undefined) {
      return restCommandOutput
    }

    const { returnValues } = this[$options]

    const formattedItem = (formatSavedItem(this[$entity], attributes, {
      partial: returnValues === 'UPDATED_NEW' || returnValues === 'UPDATED_OLD',
    }) as unknown) as ReturnedAttributes<ENTITY, OPTIONS>

    return {
      Attributes: formattedItem,
      ...restCommandOutput,
    }
  }
}

export type PutItemCommandClass = typeof PutItemCommand
