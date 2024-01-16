import {
  GetCommand,
  GetCommandInput,
  GetCommandOutput,
} from '@aws-sdk/lib-dynamodb'
import type { O } from 'ts-toolbelt'

import type { EntityV2, FormattedItem } from 'v1/entity'
import { DynamoDBToolboxError } from 'v1/errors'
import type { AnyAttributePath, KeyInput } from 'v1/operations/types'
import { formatSavedItem } from 'v1/operations/utils/formatSavedItem'

import { $entity, EntityOperation } from '../class'
import { getItemParams } from './getItemParams'
import type { GetItemOptions } from './options'

export const $key = Symbol('$key')
export type $key = typeof $key

export const $options = Symbol('$options')
export type $options = typeof $options

export type GetItemResponse<
  ENTITY extends EntityV2,
  OPTIONS extends GetItemOptions<ENTITY> = GetItemOptions<ENTITY>
> = O.Merge<
  Omit<GetCommandOutput, 'Item'>,
  {
    Item?:
      | (OPTIONS['attributes'] extends AnyAttributePath<ENTITY>[]
          ? FormattedItem<ENTITY, { attributes: OPTIONS['attributes'][number] }>
          : FormattedItem<ENTITY>)
      | undefined
  }
>

export class GetItemCommand<
  ENTITY extends EntityV2 = EntityV2,
  OPTIONS extends GetItemOptions<ENTITY> = GetItemOptions<ENTITY>
> extends EntityOperation<ENTITY> {
  static operationName = 'get' as const;

  [$key]?: KeyInput<ENTITY>
  key: (key: KeyInput<ENTITY>) => GetItemCommand<ENTITY, OPTIONS>;
  [$options]: OPTIONS
  options: <NEXT_OPTIONS extends GetItemOptions<ENTITY>>(
    nextOptions: NEXT_OPTIONS,
  ) => GetItemCommand<ENTITY, NEXT_OPTIONS>

  constructor(
    entity: ENTITY,
    key?: KeyInput<ENTITY>,
    options: OPTIONS = {} as OPTIONS,
  ) {
    super(entity)
    this[$key] = key
    this[$options] = options

    this.key = nextKey =>
      new GetItemCommand(this[$entity], nextKey, this[$options])
    this.options = nextOptions =>
      new GetItemCommand(this[$entity], this[$key], nextOptions)
  }

  params = (): GetCommandInput => {
    if (!this[$key]) {
      throw new DynamoDBToolboxError('operations.incompleteCommand', {
        message: 'GetItemCommand incomplete: Missing "key" property',
      })
    }

    return getItemParams(this[$entity], this[$key], this[$options])
  }

  send = async (): Promise<GetItemResponse<ENTITY, OPTIONS>> => {
    const getItemParams = this.params()

    const commandOutput = await this[$entity].table.documentClient.send(
      new GetCommand(getItemParams),
    )

    const { Item: item, ...restCommandOutput } = commandOutput

    if (item === undefined) {
      return restCommandOutput
    }

    const { attributes } = this[$options]
    const formattedItem = formatSavedItem(this[$entity], item, { attributes })

    return {
      Item: formattedItem,
      ...restCommandOutput,
    }
  }
}

export type GetItemCommandClass = typeof GetItemCommand
