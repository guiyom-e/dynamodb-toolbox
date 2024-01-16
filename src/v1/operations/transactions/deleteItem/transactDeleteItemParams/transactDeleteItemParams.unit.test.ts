import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { DynamoDBToolboxError, EntityV2, schema, string, TableV2 } from 'v1'

import { DeleteItemTransaction } from '../operation'

const dynamoDbClient = new DynamoDBClient({})

const documentClient = DynamoDBDocumentClient.from(dynamoDbClient)

const TestTable = new TableV2({
  name: 'test-table',
  partitionKey: {
    type: 'string',
    name: 'pk',
  },
  sortKey: {
    type: 'string',
    name: 'sk',
  },
  documentClient,
})

const TestEntity = new EntityV2({
  name: 'TestEntity',
  schema: schema({
    email: string().key().savedAs('pk'),
    sort: string().key().savedAs('sk'),
    test: string(),
  }),
  table: TestTable,
})

const TestEntity2 = new EntityV2({
  name: 'TestEntity',
  schema: schema({
    pk: string().key(),
    sk: string().key(),
    test: string(),
  }),
  table: TestTable,
})

describe('delete transaction', () => {
  it('deletes the key from inputs', async () => {
    const { TableName, Key } = TestEntity.build(DeleteItemTransaction)
      .key({ email: 'test-pk', sort: 'test-sk' })
      .params()

    expect(TableName).toBe('test-table')
    expect(Key).toStrictEqual({ pk: 'test-pk', sk: 'test-sk' })
  })

  it('filters out extra data', async () => {
    const { Key } = TestEntity.build(DeleteItemTransaction)
      .key({
        email: 'test-pk',
        sort: 'test-sk',
        // @ts-expect-error
        test: 'test',
      })
      .params()

    expect(Key).not.toHaveProperty('test')
  })

  it('fails with undefined input', () => {
    expect(() =>
      TestEntity.build(DeleteItemTransaction)
        .key(
          // @ts-expect-error
          {},
        )
        .params(),
    ).toThrow('Attribute email is required')
  })

  it('fails when missing the sortKey', () => {
    expect(() =>
      TestEntity.build(DeleteItemTransaction)
        .key(
          // @ts-expect-error
          { pk: 'test-pk' },
        )
        .params(),
    ).toThrow('Attribute email is required')
  })

  it('fails when missing partitionKey (no alias)', () => {
    expect(() =>
      TestEntity2.build(DeleteItemTransaction)
        .key(
          // @ts-expect-error
          {},
        )
        .params(),
    ).toThrow('Attribute pk is required')
  })

  it('fails when missing the sortKey (no alias)', () => {
    expect(() =>
      TestEntity2.build(DeleteItemTransaction)
        .key(
          // @ts-expect-error
          { pk: 'test-pk' },
        )
        .params(),
    ).toThrow('Attribute sk is required')
  })

  // Options
  it('fails on extra options', () => {
    const invalidCall = () =>
      TestEntity.build(DeleteItemTransaction)
        .key({ email: 'x', sort: 'y' })
        .options({
          // @ts-expect-error
          extra: true,
        })
        .params()

    expect(invalidCall).toThrow(DynamoDBToolboxError)
    expect(invalidCall).toThrow(
      expect.objectContaining({ code: 'operations.unknownOption' }),
    )
  })

  it('sets condition', () => {
    const {
      ExpressionAttributeNames,
      ExpressionAttributeValues,
      ConditionExpression,
    } = TestEntity.build(DeleteItemTransaction)
      .key({ email: 'x', sort: 'y' })
      .options({ condition: { attr: 'email', gt: 'test' } })
      .params()

    expect(ExpressionAttributeNames).toEqual({ '#c_1': 'pk' })
    expect(ExpressionAttributeValues).toEqual({ ':c_1': 'test' })
    expect(ConditionExpression).toBe('#c_1 > :c_1')
  })

  it('missing key', () => {
    const invalidCall = () => TestEntity.build(DeleteItemTransaction).params()

    expect(invalidCall).toThrow(DynamoDBToolboxError)
    expect(invalidCall).toThrow(
      expect.objectContaining({ code: 'operations.incompleteCommand' }),
    )
  })
})
