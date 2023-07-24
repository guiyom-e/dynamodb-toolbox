import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import {
  TableV2,
  EntityV2,
  schema,
  any,
  binary,
  string,
  number,
  boolean,
  set,
  list,
  map,
  ComputedDefault,
  DynamoDBToolboxError,
  UpdateItemCommand
} from 'v1'

const dynamoDbClient = new DynamoDBClient({})

const documentClient = DynamoDBDocumentClient.from(dynamoDbClient)

const TestTable = new TableV2({
  name: 'test-table',
  partitionKey: {
    type: 'string',
    name: 'pk'
  },
  sortKey: {
    type: 'string',
    name: 'sk'
  },
  documentClient
})

const TestEntity = new EntityV2({
  name: 'TestEntity',
  schema: schema({
    email: string().key().savedAs('pk'),
    sort: string().key().savedAs('sk'),
    test_string: string().optional().updateDefault('default string'),
    test_string_coerce: string().optional(),
    count: number().optional().savedAs('test_number'),
    test_number_coerce: number().optional().updateDefault(0),
    test_boolean: boolean().optional(),
    test_boolean_coerce: boolean().optional(),
    test_boolean_default: boolean().optional().updateDefault(false),
    test_list: list(any()).optional(),
    test_list_coerce: list(any()).optional(),
    test_list_required: list(any()),
    contents: map({ test: string() }).savedAs('test_map'),
    test_string_set: set(string()).optional(),
    test_number_set: set(number()).optional(),
    test_binary_set: set(binary()).optional(),
    test_string_set_type_coerce: set(string()).optional(),
    test_number_set_type_coerce: set(number()).optional(),
    test_binary: binary(),
    simple_string: string().optional()
  }),
  table: TestTable
})

const TestTable2 = new TableV2({
  name: 'test-table2',
  partitionKey: {
    type: 'string',
    name: 'pk'
  },
  documentClient
})

const TestEntity2 = new EntityV2({
  name: 'TestEntity2',
  schema: schema({
    email: string().key().savedAs('pk'),
    sort: string().savedAs('sk').optional().default(ComputedDefault),
    test: string().optional(), // TODO: prefix with test---
    test_composite: string().optional(),
    test_composite2: string().optional(),
    test_undefined: any()
      .optional()
      // TODO: use unknown
      .default(() => '')
  }),
  computedDefaults: {
    sort: ({ test_composite, test_composite2 }) =>
      test_composite && test_composite2 && [test_composite, test_composite2].join('#')
  },
  timestamps: false,
  table: TestTable2
})

const TestTable3 = new TableV2({
  name: 'test-table3',
  partitionKey: {
    type: 'string',
    name: 'pk'
  },
  documentClient
})

const TestEntity3 = new EntityV2({
  name: 'TestEntity3',
  schema: schema({
    email: string().key().savedAs('pk'),
    test: string(),
    test2: string().required('always'),
    test3: number()
  }),
  timestamps: false,
  table: TestTable3
})

const TestTable4 = new TableV2({
  name: 'test-table4',
  partitionKey: {
    type: 'string',
    name: 'pk'
  },
  documentClient
})

const TestEntity4 = new EntityV2({
  name: 'TestEntity4',
  schema: schema({
    email: string().key().savedAs('pk'),
    test_number_default_with_map: number().savedAs('test_mapped_number').default(0)
    // TODO: not sure what onUpdate could be reimplemented by
    // {
    //   type: 'number',
    //   map: 'test_mapped_number',
    //   default: 0,
    //   onUpdate: false
    // }
  }),
  timestamps: false,
  table: TestTable4
})

describe('update', () => {
  it('creates default update', () => {
    const {
      TableName,
      Key,
      UpdateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues
    } = TestEntity.build(UpdateItemCommand).item({ email: 'test-pk', sort: 'test-sk' }).params()

    expect(UpdateExpression).toBe(
      ''
      // TODO
      // 'SET #test_string = if_not_exists(#test_string,:test_string), #test_number_coerce = if_not_exists(#test_number_coerce,:test_number_coerce), #test_boolean_default = if_not_exists(#test_boolean_default,:test_boolean_default), #_ct = if_not_exists(#_ct,:_ct), #_md = :_md, #_et = if_not_exists(#_et,:_et)'
    )

    expect(ExpressionAttributeNames).toStrictEqual({
      // TODO
      // '#_et': '_et',
      // '#_ct': '_ct',
      // '#_md': '_md',
      // '#test_string': 'test_string',
      // '#test_boolean_default': 'test_boolean_default',
      // '#test_number_coerce': 'test_number_coerce'
    })

    expect(ExpressionAttributeValues).toMatchObject({
      // TODO
      // ':_et': TestEntity.name,
      // ':_ct': expect.any(String),
      // ':_md': expect.any(String),
      // ':test_string': 'test string',
      // ':test_number_coerce': 0,
      // ':test_boolean_default': false
    })

    expect(Key).toStrictEqual({
      pk: 'test-pk',
      sk: 'test-sk'
    })

    expect(TableName).toBe('test-table')
  })

  it('creates update with multiple fields (default types)', () => {
    const {
      UpdateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues
    } = TestEntity.build(UpdateItemCommand)
      .item({
        email: 'test-pk',
        sort: 'test-sk',
        test_string: 'test string'
      })
      .params()

    expect(UpdateExpression).toBe(
      ''
      // TODO
      // 'SET #test_string = :test_string, #test_number_coerce = if_not_exists(#test_number_coerce,:test_number_coerce), #test_boolean_default = if_not_exists(#test_boolean_default,:test_boolean_default), #_ct = if_not_exists(#_ct,:_ct), #_md = :_md, #_et = if_not_exists(#_et,:_et)'
    )

    expect(ExpressionAttributeNames).toMatchObject({
      // TODO
      // '#test_string': 'test_string'
    })

    expect(ExpressionAttributeValues).toMatchObject({
      // TODO
      // ':test_string': 'test string'
    })
  })

  it('allows overriding default field values', () => {
    const {
      UpdateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues
    } = TestEntity.build(UpdateItemCommand)
      .item({
        email: 'test-pk',
        sort: 'test-sk',
        test_boolean_default: true
      })
      .params()

    expect(UpdateExpression).toBe(
      ''
      // TODO
      // 'SET #test_string = if_not_exists(#test_string,:test_string), #test_number_coerce = if_not_exists(#test_number_coerce,:test_number_coerce), #test_boolean_default = :test_boolean_default, #_ct = if_not_exists(#_ct,:_ct), #_md = :_md, #_et = if_not_exists(#_et,:_et)'
    )

    expect(ExpressionAttributeNames).toMatchObject({
      // TODO
      // '#test_boolean_default': 'test_boolean_default'
    })

    expect(ExpressionAttributeValues).toMatchObject({
      // TODO
      // ':test_boolean_default': true
    })
  })

  it('allows overriding default field values that use mapping', () => {
    const {
      UpdateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues
    } = TestEntity4.build(UpdateItemCommand)
      .item({
        email: 'test-pk',
        test_number_default_with_map: 111
      })
      .params()

    expect(UpdateExpression).toBe(
      ''
      // TODO
      // 'SET #test_mapped_number = :test_mapped_number'
    )

    expect(ExpressionAttributeNames).toMatchObject({
      // TODO
      // '#test_mapped_number': 'test_mapped_number'
    })

    expect(ExpressionAttributeValues).toMatchObject({
      // TODO
      // ':test_mapped_number': 111
    })
  })

  // TODO: Implement removes, but actually I'm not sure this behavior is correct
  // Shouldn't we prevent removing fields that are required rather?
  // it('fails when removing fields with default values', () => {
  //   expect(() =>
  //     TestEntity.updateParams({ email: 'test-pk', sort: 'test-sk', $remove: 'test_string' })
  //   ).toThrow(`'test_string' has a default value and cannot be removed`)
  // })

  it('creates update that just removes a field', () => {
    const { UpdateExpression, ExpressionAttributeNames } = TestEntity2.build(UpdateItemCommand)
      .item({
        email: 'test-pk'
        // TODO: Allow remove()
        // test: null
      })
      .params()

    expect(UpdateExpression).toBe(
      ''
      // TODO
      // 'REMOVE #test'
    )

    expect(ExpressionAttributeNames).toMatchObject({
      // TODO
      // '#test': 'test'
    })
  })

  it('creates update that just removes a composite field', () => {
    const { UpdateExpression, ExpressionAttributeNames } = TestEntity2.build(UpdateItemCommand)
      .item({
        email: 'test-pk'
        // TODO: Allow remove()
        // test_composite: null
      })
      .params()

    expect(UpdateExpression).toBe(
      ''
      // TODO
      // 'REMOVE #test_composite'
    )

    expect(ExpressionAttributeNames).toMatchObject({
      // TODO
      // '#test_composite': 'test_composite'
    })
  })

  // TODO: Allow remove()
  // it('fails removing an invalid attribute', () => {
  //   // @ts-expect-error
  //   expect(() => TestEntity.updateParams({ email: 'x', sort: 'y', $remove: 'missing' })).toThrow(
  //     `'missing' is not a valid attribute and cannot be removed`
  //   )
  // })

  // it('fails when trying to remove the paritionKey', () => {
  //   // @ts-expect-error
  //   expect(() => TestEntity.updateParams({ email: 'x', sort: 'y', $remove: 'pk' })).toThrow(
  //     `'pk' is the partitionKey and cannot be removed`
  //   )
  // })

  // it('fails when trying to remove the sortKey', () => {
  //   // @ts-expect-error
  //   expect(() => TestEntity.updateParams({ email: 'x', sort: 'y', $remove: ['sk'] })).toThrow(
  //     `'sk' is the sortKey and cannot be removed`
  //   )
  // })

  // it('creates update that just saves a composite field', () => {
  //   const {
  //     TableName,
  //     Key,
  //     UpdateExpression,
  //     ExpressionAttributeNames,
  //     ExpressionAttributeValues
  //   } = TestEntity2.updateParams({ email: 'test-pk', test_composite: 'test' })

  //   expect(UpdateExpression).toBe('SET #test_composite = :test_composite')
  //   expect(ExpressionAttributeNames).toEqual({ '#test_composite': 'test_composite' })
  //   expect(ExpressionAttributeValues).toEqual({ ':test_composite': 'test' })
  //   expect(Key).toEqual({ pk: 'test-pk' })
  //   expect(TableName).toBe('test-table2')
  // })

  // it('validates field types', () => {
  //   const { TableName, Key, UpdateExpression, ExpressionAttributeValues } = TestEntity.updateParams(
  //     {
  //       email: 'test-pk',
  //       sort: 'test-sk',
  //       test_string: 'test',
  //       test_number: 1,
  //       test_boolean: false,
  //       test_list: ['a', 'b', 'c'],
  //       test_map: { a: 1, b: 2 },
  //       test_binary: Buffer.from('test'),
  //       test_boolean_default: false,
  //       test_number_coerce: 0
  //     }
  //   )

  //   expect(UpdateExpression).toBe(
  //     'SET #test_string = :test_string, #test_number_coerce = :test_number_coerce, #test_boolean_default = :test_boolean_default, #_ct = if_not_exists(#_ct,:_ct), #_md = :_md, #_et = if_not_exists(#_et,:_et), #test_number = :test_number, #test_boolean = :test_boolean, #test_list = :test_list, #test_map = :test_map, #test_binary = :test_binary'
  //   )

  //   expect(ExpressionAttributeValues?.[':test_string']).toBe('test')
  //   expect(ExpressionAttributeValues?.[':test_number']).toBe(1)
  //   expect(ExpressionAttributeValues?.[':test_number_coerce']).toBe(0)
  //   expect(ExpressionAttributeValues?.[':test_boolean']).toBe(false)
  //   expect(ExpressionAttributeValues?.[':test_boolean_default']).toBe(false)
  //   expect(ExpressionAttributeValues?.[':test_list']).toEqual(['a', 'b', 'c'])
  //   expect(ExpressionAttributeValues?.[':test_map']).toEqual({ a: 1, b: 2 })
  //   expect(ExpressionAttributeValues?.[':test_binary']).toEqual(Buffer.from('test'))
  //   expect(Key).toEqual({ pk: 'test-pk', sk: 'test-sk' })
  //   expect(TableName).toBe('test-table')
  // })

  // it('coerces values to proper type', () => {
  //   const { TableName, Key, ExpressionAttributeValues } = TestEntity.updateParams({
  //     pk: 'test-pk',
  //     sk: 'test-sk',
  //     // @ts-expect-error 💥 TODO: Support coerce keyword
  //     test_string_coerce: 1,
  //     // @ts-expect-error 💥 TODO: Support coerce keyword
  //     test_number_coerce: '1',
  //     // @ts-expect-error 💥 TODO: Support coerce keyword
  //     test_boolean_coerce: 'true',
  //     // @ts-expect-error 💥 TODO: Support coerce keyword
  //     test_list_coerce: 'a, b, c'
  //   })

  //   assert.ok(ExpressionAttributeValues !== undefined, 'ExpressionAttributeValues is undefined')
  //   expect(ExpressionAttributeValues?.[':test_string_coerce']).toBe('1')
  //   expect(ExpressionAttributeValues?.[':test_number_coerce']).toBe(1)
  //   expect(ExpressionAttributeValues?.[':test_boolean_coerce']).toBe(true)
  //   expect(ExpressionAttributeValues?.[':test_list_coerce']).toEqual(['a', 'b', 'c'])
  //   expect(Key).toEqual({ pk: 'test-pk', sk: 'test-sk' })
  //   expect(TableName).toBe('test-table')
  // })

  // it('coerces falsy string values to boolean', () => {
  //   const { ExpressionAttributeValues } = TestEntity.updateParams({
  //     pk: 'test-pk',
  //     sk: 'test-sk',
  //     // @ts-expect-error 💥 TODO: Support coerce keyword
  //     test_boolean_coerce: 'false'
  //   })
  //   expect(ExpressionAttributeValues?.[':test_boolean_coerce']).toBe(false)
  // })

  // it('creates a set', () => {
  //   const { TableName, Key, ExpressionAttributeValues } = TestEntity.updateParams({
  //     email: 'test-pk',
  //     sort: 'test-sk',
  //     test_string_set: ['1', '2', '3'],
  //     test_number_set: [1, 2, 3],
  //     test_binary_set: [Buffer.from('1'), Buffer.from('2'), Buffer.from('3')],
  //     test_string_set_type: ['1', '2', '3'],
  //     test_number_set_type: [1, 2, 3],
  //     test_binary_set_type: [Buffer.from('1'), Buffer.from('2'), Buffer.from('3')]
  //   })

  //   expect(ExpressionAttributeValues?.[':test_string_set']).toEqual(new Set(['1', '2', '3']))
  //   expect(ExpressionAttributeValues?.[':test_number_set']).toEqual(new Set([1, 2, 3]))
  //   expect(ExpressionAttributeValues?.[':test_binary_set']).toEqual(
  //     new Set([Buffer.from('1'), Buffer.from('2'), Buffer.from('3')])
  //   )
  //   expect(ExpressionAttributeValues?.[':test_string_set_type']).toEqual(new Set(['1', '2', '3']))
  //   expect(ExpressionAttributeValues?.[':test_number_set_type']).toEqual(new Set([1, 2, 3]))
  //   expect(ExpressionAttributeValues?.[':test_binary_set_type']).toEqual(
  //     new Set([Buffer.from('1'), Buffer.from('2'), Buffer.from('3')])
  //   )
  //   expect(Key).toEqual({ pk: 'test-pk', sk: 'test-sk' })
  //   expect(TableName).toBe('test-table')
  // })

  // it('performs an add operation', () => {
  //   const {
  //     TableName,
  //     Key,
  //     UpdateExpression,
  //     ExpressionAttributeNames,
  //     ExpressionAttributeValues
  //   } = TestEntity.updateParams({
  //     email: 'test-pk',
  //     sort: 'test-sk',
  //     test_number: { $add: 10 },
  //     test_number_set_type: { $add: [1, 2, 3] }
  //   })
  //   expect(UpdateExpression).toBe(
  //     'SET #test_string = if_not_exists(#test_string,:test_string), #test_number_coerce = if_not_exists(#test_number_coerce,:test_number_coerce), #test_boolean_default = if_not_exists(#test_boolean_default,:test_boolean_default), #_ct = if_not_exists(#_ct,:_ct), #_md = :_md, #_et = if_not_exists(#_et,:_et) ADD #test_number :test_number, #test_number_set_type :test_number_set_type'
  //   )
  //   expect(ExpressionAttributeNames).toEqual({
  //     '#_md': '_md',
  //     '#_ct': '_ct',
  //     '#test_string': 'test_string',
  //     '#_et': '_et',
  //     '#test_boolean_default': 'test_boolean_default',
  //     '#test_number': 'test_number',
  //     '#test_number_set_type': 'test_number_set_type',
  //     '#test_number_coerce': 'test_number_coerce'
  //   })

  //   assert.ok(ExpressionAttributeValues !== undefined, 'ExpressionAttributeValues is undefined')
  //   expect(ExpressionAttributeValues).toHaveProperty(':_md')
  //   expect(ExpressionAttributeValues).toHaveProperty(':_ct')
  //   expect(ExpressionAttributeValues).not.toHaveProperty(':pk')
  //   expect(ExpressionAttributeValues).not.toHaveProperty(':sk')
  //   expect(ExpressionAttributeValues).toHaveProperty(':_et')
  //   expect(ExpressionAttributeValues?.[':_et']).toBe('TestEntity')
  //   expect(ExpressionAttributeValues?.[':test_number']).toBe(10)
  //   expect(Array.from(ExpressionAttributeValues?.[':test_number_set_type'])).toEqual([1, 2, 3])
  //   expect(Key).toEqual({ pk: 'test-pk', sk: 'test-sk' })
  //   expect(TableName).toBe('test-table')
  // })

  // it('ignores fields with no value', () => {
  //   const { ExpressionAttributeValues } = TestEntity.updateParams({
  //     email: 'test-pk',
  //     sort: 'test-pk',
  //     test_string: undefined,
  //     test_number: undefined,
  //     test_number_set: undefined,
  //     test_string_set: undefined,
  //     test_list: undefined,
  //     test_map: undefined
  //   })

  //   expect(ExpressionAttributeValues).not.toHaveProperty(':test_string')
  //   expect(ExpressionAttributeValues).not.toHaveProperty(':test_number')
  //   expect(ExpressionAttributeValues).not.toHaveProperty(':test_number_set')
  //   expect(ExpressionAttributeValues).not.toHaveProperty(':test_string_set')
  //   expect(ExpressionAttributeValues).not.toHaveProperty(':test_list')
  //   expect(ExpressionAttributeValues).not.toHaveProperty(':test_map')
  // })

  // it('performs a delete operation', () => {
  //   const {
  //     TableName,
  //     Key,
  //     UpdateExpression,
  //     ExpressionAttributeNames,
  //     ExpressionAttributeValues
  //   } = TestEntity.updateParams({
  //     email: 'test-pk',
  //     sort: 'test-sk',
  //     test_string_set_type: { $delete: ['1', '2', '3'] },
  //     test_number_set_type: { $delete: [1, 2, 3] }
  //   })
  //   expect(UpdateExpression).toBe(
  //     'SET #test_string = if_not_exists(#test_string,:test_string), #test_number_coerce = if_not_exists(#test_number_coerce,:test_number_coerce), #test_boolean_default = if_not_exists(#test_boolean_default,:test_boolean_default), #_ct = if_not_exists(#_ct,:_ct), #_md = :_md, #_et = if_not_exists(#_et,:_et) DELETE #test_string_set_type :test_string_set_type, #test_number_set_type :test_number_set_type'
  //   )
  //   expect(ExpressionAttributeNames).toEqual({
  //     '#test_string': 'test_string',
  //     '#_et': '_et',
  //     '#_ct': '_ct',
  //     '#_md': '_md',
  //     '#test_boolean_default': 'test_boolean_default',
  //     '#test_string_set_type': 'test_string_set_type',
  //     '#test_number_set_type': 'test_number_set_type',
  //     '#test_number_coerce': 'test_number_coerce'
  //   })

  //   assert.ok(ExpressionAttributeValues !== undefined, 'ExpressionAttributeValues is undefined')
  //   expect(ExpressionAttributeValues).toHaveProperty(':_md')
  //   expect(ExpressionAttributeValues).toHaveProperty(':_ct')
  //   expect(ExpressionAttributeValues).not.toHaveProperty(':pk')
  //   expect(ExpressionAttributeValues).not.toHaveProperty(':sk')
  //   expect(ExpressionAttributeValues).toHaveProperty(':_et')
  //   expect(ExpressionAttributeValues?.[':_et']).toBe('TestEntity')
  //   expect(Array.from(ExpressionAttributeValues?.[':test_string_set_type'])).toEqual([
  //     '1',
  //     '2',
  //     '3'
  //   ])
  //   expect(Array.from(ExpressionAttributeValues?.[':test_number_set_type'])).toEqual([1, 2, 3])
  //   expect(Key).toEqual({ pk: 'test-pk', sk: 'test-sk' })
  //   expect(TableName).toBe('test-table')
  // })

  // it('removes items from a list', () => {
  //   const {
  //     TableName,
  //     Key,
  //     UpdateExpression,
  //     ExpressionAttributeNames,
  //     ExpressionAttributeValues
  //   } = TestEntity.updateParams({
  //     email: 'test-pk',
  //     sort: 'test-sk',
  //     test_list: { $remove: [2, 3, 8] }
  //   })
  //   expect(UpdateExpression).toBe(
  //     'SET #test_string = if_not_exists(#test_string,:test_string), #test_number_coerce = if_not_exists(#test_number_coerce,:test_number_coerce), #test_boolean_default = if_not_exists(#test_boolean_default,:test_boolean_default), #_ct = if_not_exists(#_ct,:_ct), #_md = :_md, #_et = if_not_exists(#_et,:_et) REMOVE #test_list[2], #test_list[3], #test_list[8]'
  //   )

  //   assert.ok(ExpressionAttributeValues !== undefined, 'ExpressionAttributeValues is undefined')
  //   expect(ExpressionAttributeNames).toEqual({
  //     '#test_string': 'test_string',
  //     '#_et': '_et',
  //     '#_ct': '_ct',
  //     '#_md': '_md',
  //     '#test_boolean_default': 'test_boolean_default',
  //     '#test_list': 'test_list',
  //     '#test_number_coerce': 'test_number_coerce'
  //   })
  //   expect(ExpressionAttributeValues).toHaveProperty(':_md')
  //   expect(ExpressionAttributeValues).toHaveProperty(':_ct')
  //   expect(ExpressionAttributeValues).not.toHaveProperty(':pk')
  //   expect(ExpressionAttributeValues).not.toHaveProperty(':sk')
  //   expect(ExpressionAttributeValues).toHaveProperty(':_et')
  //   expect(ExpressionAttributeValues?.[':_et']).toBe('TestEntity')
  //   expect(Key).toEqual({ pk: 'test-pk', sk: 'test-sk' })
  //   expect(TableName).toBe('test-table')
  // })

  // it('updates specific items in a list', () => {
  //   const {
  //     TableName,
  //     Key,
  //     UpdateExpression,
  //     ExpressionAttributeNames,
  //     ExpressionAttributeValues
  //   } = TestEntity.updateParams({
  //     email: 'test-pk',
  //     sort: 'test-sk',
  //     // @ts-expect-error 💥 TODO: Improve list support
  //     test_list: { 2: 'Test2', 5: 'Test5' }
  //   })
  //   expect(UpdateExpression).toBe(
  //     'SET #test_string = if_not_exists(#test_string,:test_string), #test_number_coerce = if_not_exists(#test_number_coerce,:test_number_coerce), #test_boolean_default = if_not_exists(#test_boolean_default,:test_boolean_default), #_ct = if_not_exists(#_ct,:_ct), #_md = :_md, #_et = if_not_exists(#_et,:_et), #test_list[2] = :test_list_2, #test_list[5] = :test_list_5'
  //   )

  //   assert.ok(ExpressionAttributeValues !== undefined, 'ExpressionAttributeValues is undefined')
  //   expect(ExpressionAttributeNames).toEqual({
  //     '#test_string': 'test_string',
  //     '#_et': '_et',
  //     '#_ct': '_ct',
  //     '#_md': '_md',
  //     '#test_boolean_default': 'test_boolean_default',
  //     '#test_list': 'test_list',
  //     '#test_number_coerce': 'test_number_coerce'
  //   })
  //   expect(ExpressionAttributeValues).toHaveProperty(':_md')
  //   expect(ExpressionAttributeValues).toHaveProperty(':_ct')
  //   expect(ExpressionAttributeValues).not.toHaveProperty(':pk')
  //   expect(ExpressionAttributeValues).not.toHaveProperty(':sk')
  //   expect(ExpressionAttributeValues).toHaveProperty(':_et')
  //   expect(ExpressionAttributeValues?.[':_et']).toBe('TestEntity')
  //   expect(ExpressionAttributeValues?.[':test_list_2']).toBe('Test2')
  //   expect(ExpressionAttributeValues?.[':test_list_5']).toBe('Test5')
  //   expect(Key).toEqual({ pk: 'test-pk', sk: 'test-sk' })
  //   expect(TableName).toBe('test-table')
  // })

  // it('appends and prepends data to a list', () => {
  //   const {
  //     TableName,
  //     Key,
  //     UpdateExpression,
  //     ExpressionAttributeNames,
  //     ExpressionAttributeValues
  //   } = TestEntity.updateParams({
  //     email: 'test-pk',
  //     sort: 'test-sk',
  //     test_list: { $append: [1, 2, 3] },
  //     test_list_coerce: { $prepend: [1, 2, 3] }
  //   })
  //   expect(UpdateExpression).toBe(
  //     `SET #test_string = if_not_exists(#test_string,:test_string), #test_number_coerce = if_not_exists(#test_number_coerce,:test_number_coerce), #test_boolean_default = if_not_exists(#test_boolean_default,:test_boolean_default), #_ct = if_not_exists(#_ct,:_ct), #_md = :_md, #_et = if_not_exists(#_et,:_et), #test_list = list_append(if_not_exists(#test_list, :${ATTRIBUTE_VALUES_LIST_DEFAULT_KEY}) ,:test_list), #test_list_coerce = list_append(:test_list_coerce, if_not_exists(#test_list_coerce, :${ATTRIBUTE_VALUES_LIST_DEFAULT_KEY}))`
  //   )

  //   assert.ok(ExpressionAttributeValues !== undefined, 'ExpressionAttributeValues is undefined')
  //   expect(ExpressionAttributeNames).toEqual({
  //     '#test_string': 'test_string',
  //     '#_et': '_et',
  //     '#_ct': '_ct',
  //     '#_md': '_md',
  //     '#test_boolean_default': 'test_boolean_default',
  //     '#test_list': 'test_list',
  //     '#test_list_coerce': 'test_list_coerce',
  //     '#test_number_coerce': 'test_number_coerce'
  //   })
  //   expect(ExpressionAttributeValues).toHaveProperty(':_md')
  //   expect(ExpressionAttributeValues).toHaveProperty(':_ct')
  //   expect(ExpressionAttributeValues).not.toHaveProperty(':pk')
  //   expect(ExpressionAttributeValues).not.toHaveProperty(':sk')
  //   expect(ExpressionAttributeValues).toHaveProperty(':_et')
  //   expect(ExpressionAttributeValues?.[':_et']).toBe('TestEntity')
  //   expect(ExpressionAttributeValues?.[':test_list']).toEqual([1, 2, 3])
  //   expect(ExpressionAttributeValues?.[':test_list_coerce']).toEqual([1, 2, 3])
  //   expect(Key).toEqual({ pk: 'test-pk', sk: 'test-sk' })
  //   expect(TableName).toBe('test-table')
  // })

  // it('provides a default list value when appending/prepending a value to a list', () => {
  //   const { TableName, Key, ExpressionAttributeValues } = TestEntity.updateParams({
  //     email: 'test-pk',
  //     sort: 'test-sk',
  //     test_list: { $append: [1, 2, 3] },
  //     test_list_coerce: { $prepend: [1, 2, 3] }
  //   })

  //   expect(TableName).toBe('test-table')
  //   expect(Key).toEqual({ pk: 'test-pk', sk: 'test-sk' })

  //   assert.ok(ExpressionAttributeValues !== undefined, 'ExpressionAttributeValues is undefined')
  //   expect(ExpressionAttributeValues?.[`:${ATTRIBUTE_VALUES_LIST_DEFAULT_KEY}`]).toBe(
  //     ATTRIBUTE_VALUES_LIST_DEFAULT_VALUE
  //   )
  // })

  // it("doesn't provide a default list value when not appending/prepending a value to a list", () => {
  //   const { TableName, Key, ExpressionAttributeValues } = TestEntity.updateParams({
  //     email: 'test-pk',
  //     sort: 'test-sk'
  //   })

  //   expect(TableName).toBe('test-table')
  //   expect(Key).toEqual({ pk: 'test-pk', sk: 'test-sk' })

  //   expect(ExpressionAttributeValues).not.toHaveProperty(ATTRIBUTE_VALUES_LIST_DEFAULT_KEY)
  // })

  // it("doesn't provide a default list value when not appending/prepending a value to a nested list within a map.", () => {
  //   const {
  //     TableName,
  //     Key,
  //     UpdateExpression,
  //     ExpressionAttributeNames,
  //     ExpressionAttributeValues
  //   } = TestEntity.updateParams({
  //     email: 'test-pk',
  //     sort: 'test-sk',
  //     test_map: {
  //       $set: {
  //         prop1: 'some-value'
  //       }
  //     }
  //   })

  //   expect(Key).toEqual({ pk: 'test-pk', sk: 'test-sk' })
  //   expect(TableName).toBe('test-table')

  //   expect(UpdateExpression).toBe(
  //     'SET #test_string = if_not_exists(#test_string,:test_string), #test_number_coerce = if_not_exists(#test_number_coerce,:test_number_coerce), #test_boolean_default = if_not_exists(#test_boolean_default,:test_boolean_default), #_ct = if_not_exists(#_ct,:_ct), #_md = :_md, #_et = if_not_exists(#_et,:_et), #test_map.#test_map_prop1 = :test_map_prop1'
  //   )

  //   expect(ExpressionAttributeNames).toEqual(
  //     expect.objectContaining({
  //       '#test_map': 'test_map',
  //       '#test_map_prop1': 'prop1'
  //     })
  //   )
  //   expect(ExpressionAttributeValues).toEqual(
  //     expect.objectContaining({
  //       ':test_map_prop1': 'some-value'
  //     })
  //   )
  //   expect(ExpressionAttributeValues).not.toHaveProperty(`:${ATTRIBUTE_VALUES_LIST_DEFAULT_KEY}`)
  // })

  // it('updates nested data in a map', () => {
  //   const {
  //     TableName,
  //     Key,
  //     UpdateExpression,
  //     ExpressionAttributeNames,
  //     ExpressionAttributeValues
  //   } = TestEntity.updateParams({
  //     email: 'test-pk',
  //     sort: 'test-sk',
  //     test_map: {
  //       $set: {
  //         prop1: 'some value',
  //         'prop2[1]': 'list value',
  //         'prop2[4]': 'list value4',
  //         'prop3.prop4': 'nested',
  //         prop5: [1, 2, 3]
  //       }
  //     }
  //   })
  //   expect(UpdateExpression).toBe(
  //     'SET #test_string = if_not_exists(#test_string,:test_string), #test_number_coerce = if_not_exists(#test_number_coerce,:test_number_coerce), #test_boolean_default = if_not_exists(#test_boolean_default,:test_boolean_default), #_ct = if_not_exists(#_ct,:_ct), #_md = :_md, #_et = if_not_exists(#_et,:_et), #test_map.#test_map_prop1 = :test_map_prop1, #test_map.#test_map_prop2[1] = :test_map_prop2_1, #test_map.#test_map_prop2[4] = :test_map_prop2_4, #test_map.#test_map_prop3.#test_map_prop3_prop4 = :test_map_prop3_prop4, #test_map.#test_map_prop5 = :test_map_prop5'
  //   )

  //   assert.ok(ExpressionAttributeValues !== undefined, 'ExpressionAttributeValues is undefined')
  //   expect(ExpressionAttributeNames).toEqual({
  //     '#_et': '_et',
  //     '#_ct': '_ct',
  //     '#_md': '_md',
  //     '#test_boolean_default': 'test_boolean_default',
  //     '#test_string': 'test_string',
  //     '#test_map_prop1': 'prop1',
  //     '#test_map_prop2': 'prop2',
  //     '#test_map_prop3': 'prop3',
  //     '#test_map_prop3_prop4': 'prop4',
  //     '#test_map_prop5': 'prop5',
  //     '#test_map': 'test_map',
  //     '#test_number_coerce': 'test_number_coerce'
  //   })
  //   expect(ExpressionAttributeValues).toHaveProperty(':_et')
  //   expect(ExpressionAttributeValues?.[':_et']).toBe('TestEntity')
  //   expect(ExpressionAttributeValues?.[':test_string']).toBe('default string')
  //   expect(ExpressionAttributeValues?.[':test_map_prop1']).toBe('some value')
  //   expect(ExpressionAttributeValues?.[':test_map_prop2_1']).toBe('list value')
  //   expect(ExpressionAttributeValues?.[':test_map_prop2_4']).toBe('list value4')
  //   expect(ExpressionAttributeValues?.[':test_map_prop3_prop4']).toBe('nested')
  //   expect(ExpressionAttributeValues?.[':test_map_prop5']).toEqual([1, 2, 3])
  //   expect(Key).toEqual({ pk: 'test-pk', sk: 'test-sk' })
  //   expect(TableName).toBe('test-table')
  // })

  // it('supports appending/prepending nested lists in a map.', () => {
  //   const {
  //     TableName,
  //     Key,
  //     UpdateExpression,
  //     ExpressionAttributeNames,
  //     ExpressionAttributeValues
  //   } = TestEntity.updateParams({
  //     email: 'test-pk',
  //     sort: 'test-sk',
  //     test_map: {
  //       $set: {
  //         prop1: {
  //           $append: [1, 2, 3]
  //         },
  //         prop2: {
  //           $prepend: [1, 2, 3]
  //         },
  //         'prop3.prop4': {
  //           $append: [1, 2, 3]
  //         }
  //       }
  //     }
  //   })

  //   expect(Key).toEqual({ pk: 'test-pk', sk: 'test-sk' })
  //   expect(TableName).toBe('test-table')

  //   expect(UpdateExpression).toBe(
  //     `SET #test_string = if_not_exists(#test_string,:test_string), #test_number_coerce = if_not_exists(#test_number_coerce,:test_number_coerce), #test_boolean_default = if_not_exists(#test_boolean_default,:test_boolean_default), #_ct = if_not_exists(#_ct,:_ct), #_md = :_md, #_et = if_not_exists(#_et,:_et), #test_map.#test_map_prop1 = list_append(if_not_exists(#test_map.#test_map_prop1, :${ATTRIBUTE_VALUES_LIST_DEFAULT_KEY}), :test_map_prop1), #test_map.#test_map_prop2 = list_append(:test_map_prop2, if_not_exists(#test_map.#test_map_prop2, :${ATTRIBUTE_VALUES_LIST_DEFAULT_KEY})), #test_map.#test_map_prop3.#test_map_prop3_prop4 = list_append(if_not_exists(#test_map.#test_map_prop3.#test_map_prop3_prop4, :${ATTRIBUTE_VALUES_LIST_DEFAULT_KEY}), :test_map_prop3_prop4)`
  //   )

  //   assert.ok(ExpressionAttributeValues !== undefined, 'ExpressionAttributeValues is undefined')
  //   expect(ExpressionAttributeNames).toEqual(
  //     expect.objectContaining({
  //       '#test_map': 'test_map',
  //       '#test_map_prop1': 'prop1',
  //       '#test_map_prop2': 'prop2',
  //       '#test_map_prop3': 'prop3',
  //       '#test_map_prop3_prop4': 'prop4'
  //     })
  //   )
  //   expect(ExpressionAttributeValues).toEqual(
  //     expect.objectContaining({
  //       ':test_map_prop1': [1, 2, 3],
  //       ':test_map_prop2': [1, 2, 3],
  //       ':test_map_prop3_prop4': [1, 2, 3],
  //       [`:${ATTRIBUTE_VALUES_LIST_DEFAULT_KEY}`]: []
  //     })
  //   )
  // })

  // it('removes nested data in a map when set to null or undefined', () => {
  //   const {
  //     TableName,
  //     Key,
  //     UpdateExpression,
  //     ExpressionAttributeNames,
  //     ExpressionAttributeValues
  //   } = TestEntity.updateParams({
  //     email: 'test-pk',
  //     sort: 'test-sk',
  //     test_map: {
  //       $set: {
  //         prop1: null,
  //         prop2: undefined
  //       }
  //     }
  //   })

  //   expect(ExpressionAttributeNames).toEqual({
  //     '#_et': '_et',
  //     '#_ct': '_ct',
  //     '#_md': '_md',
  //     '#test_boolean_default': 'test_boolean_default',
  //     '#test_string': 'test_string',
  //     '#test_map': 'test_map',
  //     '#test_map_prop1': 'prop1',
  //     '#test_map_prop2': 'prop2',
  //     '#test_number_coerce': 'test_number_coerce'
  //   })

  //   assert.ok(ExpressionAttributeValues !== undefined, 'ExpressionAttributeValues is undefined')
  //   expect(ExpressionAttributeValues).toHaveProperty(':_et')
  //   expect(ExpressionAttributeValues?.[':_et']).toBe('TestEntity')
  //   expect(ExpressionAttributeValues?.[':test_string']).toBe('default string')
  //   expect(ExpressionAttributeValues).not.toHaveProperty(':test_map_prop1')
  //   expect(ExpressionAttributeValues).not.toHaveProperty(':test_map_prop2')

  //   expect(UpdateExpression).toBe(
  //     'SET #test_string = if_not_exists(#test_string,:test_string), #test_number_coerce = if_not_exists(#test_number_coerce,:test_number_coerce), #test_boolean_default = if_not_exists(#test_boolean_default,:test_boolean_default), #_ct = if_not_exists(#_ct,:_ct), #_md = :_md, #_et = if_not_exists(#_et,:_et) REMOVE #test_map.#test_map_prop1, #test_map.#test_map_prop2'
  //   )
  //   expect(Key).toEqual({ pk: 'test-pk', sk: 'test-sk' })
  //   expect(TableName).toBe('test-table')
  // })

  // it('uses an alias', async () => {
  //   const {
  //     TableName,
  //     Key,
  //     UpdateExpression,
  //     ExpressionAttributeNames,
  //     ExpressionAttributeValues
  //   } = TestEntity.updateParams({
  //     email: 'test@test.com',
  //     sort: 'test-sk',
  //     // @ts-expect-error 💥 TODO: Handle aliases
  //     count: { $add: 10 },
  //     contents: { a: 1, b: 2 }
  //   })
  //   expect(UpdateExpression).toBe(
  //     'SET #test_string = if_not_exists(#test_string,:test_string), #test_number_coerce = if_not_exists(#test_number_coerce,:test_number_coerce), #test_boolean_default = if_not_exists(#test_boolean_default,:test_boolean_default), #_ct = if_not_exists(#_ct,:_ct), #_md = :_md, #_et = if_not_exists(#_et,:_et), #test_map = :test_map ADD #test_number :test_number'
  //   )
  //   expect(ExpressionAttributeNames).toEqual({
  //     '#_et': '_et',
  //     '#_ct': '_ct',
  //     '#_md': '_md',
  //     '#test_boolean_default': 'test_boolean_default',
  //     '#test_string': 'test_string',
  //     '#test_number': 'test_number',
  //     '#test_map': 'test_map',
  //     '#test_number_coerce': 'test_number_coerce'
  //   })
  //   expect(ExpressionAttributeValues).toHaveProperty(':_et')
  //   expect(ExpressionAttributeValues?.[':_et']).toBe('TestEntity')
  //   expect(ExpressionAttributeValues?.[':test_string']).toBe('default string')
  //   expect(ExpressionAttributeValues?.[':test_number']).toBe(10)
  //   expect(ExpressionAttributeValues?.[':test_map']).toEqual({ a: 1, b: 2 })
  //   expect(Key).toEqual({ pk: 'test@test.com', sk: 'test-sk' })
  //   expect(TableName).toBe('test-table')
  // })

  // it('accepts 0 as a valid value for required fields', () => {
  //   const { ExpressionAttributeValues } = TestEntity3.updateParams({
  //     email: 'test-pk',
  //     test2: 'test',
  //     test3: 0
  //   })
  //   expect(ExpressionAttributeValues?.[':test3']).toBe(0)
  // })

  // it('allows using list operations on a required list field', () => {
  //   const { ExpressionAttributeValues } = TestEntity.updateParams({
  //     email: 'test-pk',
  //     sort: 'test-sk',
  //     test_list_required: {
  //       $prepend: [1, 2, 3]
  //     }
  //   })
  //   expect(ExpressionAttributeValues?.[':test_list_required']).toEqual([1, 2, 3])
  // })

  // it('removes unused expression values/names when using $set for a map field with an empty object', () => {
  //   const {
  //     ExpressionAttributeValues,
  //     ExpressionAttributeNames,
  //     UpdateExpression
  //   } = TestEntity.updateParams({
  //     email: 'test-pk',
  //     sort: 'test-sk',
  //     test_map: {
  //       $set: {}
  //     }
  //   })

  //   expect(ExpressionAttributeValues).not.toHaveProperty(':test_map')
  //   expect(ExpressionAttributeNames).not.toHaveProperty('#test_map')
  //   expect(UpdateExpression).toBe(
  //     'SET #test_string = if_not_exists(#test_string,:test_string), #test_number_coerce = if_not_exists(#test_number_coerce,:test_number_coerce), #test_boolean_default = if_not_exists(#test_boolean_default,:test_boolean_default), #_ct = if_not_exists(#_ct,:_ct), #_md = :_md, #_et = if_not_exists(#_et,:_et)'
  //   )
  // })

  it('ignores additional attribute', () => {
    const { ExpressionAttributeNames = {} } = TestEntity.build(UpdateItemCommand)
      .item({
        email: 'test-pk',
        sort: 'test-sk',
        // @ts-expect-error
        fooBar: '?'
      })
      .params()

    expect(Object.values(ExpressionAttributeNames)).not.toContain('fooBar')
  })

  it('fails when missing an "always" required field', () => {
    const invalidCall = () =>
      TestEntity3.build(UpdateItemCommand)
        .item(
          // @ts-expect-error
          { email: 'test-pk' }
        )
        .params()

    expect(invalidCall).toThrow(DynamoDBToolboxError)
    expect(invalidCall).toThrow(expect.objectContaining({ code: 'parsing.attributeRequired' }))
  })

  // TODO: enables list operations
  // it('fails when using non-numeric fields for indexed list updates', () => {
  //   expect(() =>
  //     TestEntity.updateParams({
  //       pk: 'test-pk',
  //       sk: 'test-sk',
  //       // @ts-expect-error
  //       test_list: { test: 'some value' }
  //     })
  //   ).toThrow(`Properties must be numeric to update specific list items in 'test_list'`)
  // })

  // TODO: enables list operations
  // it('fails when using non-numeric values for indexed list removals', () => {
  //   expect(() =>
  //     TestEntity.updateParams({
  //       email: 'test-pk',
  //       sort: 'test-sk',
  //       // @ts-expect-error
  //       test_list: { $remove: [1, 2, 'test'] }
  //     })
  //   ).toThrow(`Remove array for 'test_list' must only contain numeric indexes`)
  // })

  it('sets capacity options', () => {
    const { ReturnConsumedCapacity } = TestEntity.build(UpdateItemCommand)
      .item({ email: 'x', sort: 'y' })
      .options({ capacity: 'NONE' })
      .params()

    expect(ReturnConsumedCapacity).toBe('NONE')
  })

  it('sets metrics options', () => {
    const { ReturnItemCollectionMetrics } = TestEntity.build(UpdateItemCommand)
      .item({ email: 'x', sort: 'y' })
      .options({ metrics: 'SIZE' })
      .params()

    expect(ReturnItemCollectionMetrics).toBe('SIZE')
  })

  it('sets returnValues options', () => {
    const { ReturnValues } = TestEntity.build(UpdateItemCommand)
      .item({ email: 'x', sort: 'y' })
      .options({ returnValues: 'ALL_OLD' })
      .params()

    expect(ReturnValues).toBe('ALL_OLD')
  })

  it('fails on invalid capacity option', () => {
    const invalidCall = () =>
      TestEntity.build(UpdateItemCommand)
        .item({ email: 'x', sort: 'y' })
        .options({
          // @ts-expect-error
          capacity: 'test'
        })
        .params()

    expect(invalidCall).toThrow(DynamoDBToolboxError)
    expect(invalidCall).toThrow(expect.objectContaining({ code: 'commands.invalidCapacityOption' }))
  })

  it('fails on invalid metrics option', () => {
    const invalidCall = () =>
      TestEntity.build(UpdateItemCommand)
        .item({ email: 'x', sort: 'y' })
        .options({
          // @ts-expect-error
          metrics: 'test'
        })
        .params()

    expect(invalidCall).toThrow(DynamoDBToolboxError)
    expect(invalidCall).toThrow(expect.objectContaining({ code: 'commands.invalidMetricsOption' }))
  })

  it('fails on invalid returnValues option', () => {
    const invalidCall = () =>
      TestEntity.build(UpdateItemCommand)
        .item({ email: 'x', sort: 'y' })
        .options({
          // @ts-expect-error
          returnValues: 'test'
        })
        .params()

    expect(invalidCall).toThrow(DynamoDBToolboxError)
    expect(invalidCall).toThrow(
      expect.objectContaining({ code: 'commands.invalidReturnValuesOption' })
    )
  })

  it('fails on extra options', () => {
    const invalidCall = () =>
      TestEntity.build(UpdateItemCommand)
        .item({ email: 'x', sort: 'y' })
        .options({
          // @ts-expect-error
          extra: true
        })
        .params()

    expect(invalidCall).toThrow(DynamoDBToolboxError)
    expect(invalidCall).toThrow(expect.objectContaining({ code: 'commands.unknownOption' }))
  })

  it('sets conditions', () => {
    const {
      ExpressionAttributeNames,
      ExpressionAttributeValues,
      ConditionExpression
    } = TestEntity.build(UpdateItemCommand)
      .item({ email: 'x', sort: 'y' })
      .options({ condition: { attr: 'email', gt: 'test' } })
      .params()

    expect(ConditionExpression).toBe('#c1 > :c1')
    expect(ExpressionAttributeNames).toMatchObject({ '#c1': 'pk' })
    expect(ExpressionAttributeValues).toMatchObject({ ':c1': 'test' })
  })

  it('missing item', () => {
    const invalidCall = () => TestEntity.build(UpdateItemCommand).params()

    expect(invalidCall).toThrow(DynamoDBToolboxError)
    expect(invalidCall).toThrow(expect.objectContaining({ code: 'commands.incompleteCommand' }))
  })
})