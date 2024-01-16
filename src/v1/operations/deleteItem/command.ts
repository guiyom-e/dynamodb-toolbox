import {
  DeleteCommand,
  DeleteCommandInput,
  DeleteCommandOutput,
} from '@aws-sdk/lib-dynamodb'
import type { O } from 'ts-toolbelt'

import type { EntityV2, FormattedItem } from 'v1/entity'
import { DynamoDBToolboxError } from 'v1/errors'
import type {
  AllOldReturnValuesOption,
  NoneReturnValuesOption,
} from 'v1/operations/constants/options/returnValues'
import type { KeyInput } from 'v1/operations/types'
import { formatSavedItem } from 'v1/operations/utils/formatSavedItem'

import { $entity, EntityOperation } from '../class'
import { deleteItemParams } from './deleteItemParams'
import type {
  DeleteItemCommandReturnValuesOption,
  DeleteItemOptions,
} from './options'

export const $key = Symbol('$key')
export type $key = typeof $key

export const $options = Symbol('$options')
export type $options = typeof $options

type ReturnedAttributes<
  ENTITY extends EntityV2,
  OPTIONS extends DeleteItemOptions<ENTITY>
> = DeleteItemCommandReturnValuesOption extends OPTIONS['returnValues']
  ? undefined
  : OPTIONS['returnValues'] extends NoneReturnValuesOption
  ? undefined
  : OPTIONS['returnValues'] extends AllOldReturnValuesOption
  ? FormattedItem<ENTITY> | undefined
  : never

export type DeleteItemResponse<
  ENTITY extends EntityV2,
  OPTIONS extends DeleteItemOptions<ENTITY> = DeleteItemOptions<ENTITY>
> = O.Merge<
  Omit<DeleteCommandOutput, 'Attributes'>,
  { Attributes?: ReturnedAttributes<ENTITY, OPTIONS> | undefined }
>

export class DeleteItemCommand<
  ENTITY extends EntityV2 = EntityV2,
  OPTIONS extends DeleteItemOptions<ENTITY> = DeleteItemOptions<ENTITY>
> extends EntityOperation<ENTITY> {
  static operationName = 'delete' as const;

  [$key]?: KeyInput<ENTITY>
  key: (keyInput: KeyInput<ENTITY>) => DeleteItemCommand<ENTITY, OPTIONS>;
  [$options]?: OPTIONS
  options: <NEXT_OPTIONS extends DeleteItemOptions<ENTITY>>(
    nextOptions: NEXT_OPTIONS,
  ) => DeleteItemCommand<ENTITY, NEXT_OPTIONS>

  constructor(
    entity: ENTITY,
    key?: KeyInput<ENTITY>,
    options: OPTIONS = {} as OPTIONS,
  ) {
    super(entity)
    this[$key] = key
    this[$options] = options

    this.key = nextKey =>
      new DeleteItemCommand(this[$entity], nextKey, this[$options])
    this.options = nextOptions =>
      new DeleteItemCommand(this[$entity], this[$key], nextOptions)
  }

  params = (): DeleteCommandInput => {
    if (!this[$key]) {
      throw new DynamoDBToolboxError('operations.incompleteCommand', {
        message: 'DeleteItemCommand incomplete: Missing "key" property',
      })
    }

    return deleteItemParams(this[$entity], this[$key], this[$options])
  }

  send = async (): Promise<DeleteItemResponse<ENTITY, OPTIONS>> => {
    const deleteItemParams = this.params()

    const commandOutput = await this[$entity].table.documentClient.send(
      new DeleteCommand(deleteItemParams),
    )

    const { Attributes: attributes, ...restCommandOutput } = commandOutput

    if (attributes === undefined) {
      return restCommandOutput
    }

    const formattedItem = formatSavedItem(this[$entity], attributes)

    return {
      Attributes: formattedItem as ReturnedAttributes<ENTITY, OPTIONS>,
      ...restCommandOutput,
    }
  }
}

export type DeleteItemCommandClass = typeof DeleteItemCommand
