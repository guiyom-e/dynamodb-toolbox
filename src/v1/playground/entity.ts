/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  any,
  EntityV2,
  FormattedItem,
  KeyInput,
  map,
  number,
  prefix,
  PutItemInput,
  SavedItem,
  schema,
  set,
  string,
  UpdateItemInput,
} from 'v1'

import { MyTable } from './table'

export const UserEntity = new EntityV2({
  name: 'User',
  table: MyTable,
  schema: schema({
    userId: string().key(),
    age: number().key().enum(41, 42).putDefault(42).savedAs('sk'),
    constant: string().const('toto').optional(),
    firstName: string().savedAs('fn'),
    lastName: string().savedAs('ln'),
    parents: map({
      father: string(),
      mother: string(),
    }),
    someSet: set(string().enum('foo', 'bar')).optional(),
    castedStr: any().castAs<'foo' | 'bar'>(),
    transformedStr: string()
      .optional()
      .enum('foo', 'bar')
      .transform(prefix('toto')),
  }).and(prevSchema => ({
    completeName: string().putLink<typeof prevSchema>(
      ({ firstName, lastName }) => firstName + ' ' + lastName,
    ),
  })),
})

type UserPutItemInput = PutItemInput<typeof UserEntity>
type SavedUser = SavedItem<typeof UserEntity>
type UserOutput = FormattedItem<typeof UserEntity>
type UserInputKeys = KeyInput<typeof UserEntity>
type UserUpdateItemInput = UpdateItemInput<typeof UserEntity>
