import type { O } from 'ts-toolbelt'

import type { Always, Schema } from 'v1/schema'
import type { IndexableKeyType, Key, TableV2 } from 'v1/table'
import type { Or } from 'v1/types/or'

type NeedsKeyPartCompute<
  SCHEMA extends Schema,
  KEY_PART_NAME extends string,
  KEY_PART_TYPE extends IndexableKeyType
> = SCHEMA['attributes'] extends Record<
  KEY_PART_NAME,
  { type: KEY_PART_TYPE; required: Always; key: true; savedAs: undefined }
>
  ? false
  : O.SelectKeys<
      SCHEMA['attributes'],
      {
        type: KEY_PART_TYPE
        required: Always
        key: true
        savedAs: KEY_PART_NAME
      }
    > extends never
  ? true
  : false

/**
 * Wether the provided schema matches the primary key of a given table
 *
 * @param SCHEMA Schema
 * @param TABLE Table
 * @return Boolean
 */
export type NeedsKeyCompute<
  SCHEMA extends Schema,
  TABLE extends TableV2
> = Key extends TABLE['sortKey']
  ? NeedsKeyPartCompute<
      SCHEMA,
      TABLE['partitionKey']['name'],
      TABLE['partitionKey']['type']
    >
  : NonNullable<TABLE['sortKey']> extends Key
  ? Or<
      NeedsKeyPartCompute<
        SCHEMA,
        TABLE['partitionKey']['name'],
        TABLE['partitionKey']['type']
      >,
      NeedsKeyPartCompute<
        SCHEMA,
        NonNullable<TABLE['sortKey']>['name'],
        NonNullable<TABLE['sortKey']>['type']
      >
    >
  : never
