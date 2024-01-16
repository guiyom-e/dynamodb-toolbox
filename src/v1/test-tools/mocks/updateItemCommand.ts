import type { UpdateCommandInput } from '@aws-sdk/lib-dynamodb'

import type { EntityV2 } from 'v1/entity'
import { DynamoDBToolboxError } from 'v1/errors'
import { $entity } from 'v1/operations/class'
import {
  UpdateItemCommand,
  UpdateItemInput,
  UpdateItemOptions,
  UpdateItemResponse,
} from 'v1/operations/updateItem'
import { $item, $options } from 'v1/operations/updateItem/command'
import { updateItemParams } from 'v1/operations/updateItem/updateItemParams'

import {
  $mockedEntity,
  $mockedImplementations,
  $operationName,
  $originalEntity,
  $receivedCommands,
} from './constants'
import type { MockedEntity } from './entity'

export class UpdateItemCommandMock<
  ENTITY extends EntityV2 = EntityV2,
  OPTIONS extends UpdateItemOptions<ENTITY> = UpdateItemOptions<ENTITY>
> implements UpdateItemCommand<ENTITY, OPTIONS> {
  static operationType = 'entity' as const
  static operationName = 'update' as const
  static [$operationName] = 'update' as const;

  [$entity]: ENTITY;
  [$item]?: UpdateItemInput<ENTITY>
  item: (
    nextItem: UpdateItemInput<ENTITY>,
  ) => UpdateItemCommandMock<ENTITY, OPTIONS>;
  [$options]: OPTIONS
  options: <NEXT_OPTIONS extends UpdateItemOptions<ENTITY>>(
    nextOptions: NEXT_OPTIONS,
  ) => UpdateItemCommandMock<ENTITY, NEXT_OPTIONS>;

  [$mockedEntity]: MockedEntity<ENTITY>

  constructor(
    mockedEntity: MockedEntity<ENTITY>,
    item?: UpdateItemInput<ENTITY>,
    options: OPTIONS = {} as OPTIONS,
  ) {
    this[$entity] = mockedEntity[$originalEntity]
    this[$mockedEntity] = mockedEntity
    this[$item] = item
    this[$options] = options

    this.item = nextItem =>
      new UpdateItemCommandMock(this[$mockedEntity], nextItem, this[$options])
    this.options = nextOptions =>
      new UpdateItemCommandMock(this[$mockedEntity], this[$item], nextOptions)
  }

  params = (): UpdateCommandInput => {
    if (!this[$item]) {
      throw new DynamoDBToolboxError('operations.incompleteCommand', {
        message: 'UpdateItemCommand incomplete: Missing "item" property',
      })
    }

    return updateItemParams(this[$entity], this[$item], this[$options])
  }

  send = async (): Promise<UpdateItemResponse<ENTITY, OPTIONS>> => {
    this[$mockedEntity][$receivedCommands].update.push([
      this[$item],
      this[$options],
    ])

    const implementation = this[$mockedEntity][$mockedImplementations].update

    if (implementation !== undefined) {
      if (!this[$item]) {
        throw new DynamoDBToolboxError('operations.incompleteCommand', {
          message: 'UpdateItemCommand incomplete: Missing "item" property',
        })
      }

      return (implementation(
        this[$item],
        this[$options],
      ) as unknown) as UpdateItemResponse<ENTITY, OPTIONS>
    }

    return new UpdateItemCommand(
      this[$entity],
      this[$item],
      this[$options],
    ).send()
  }
}
