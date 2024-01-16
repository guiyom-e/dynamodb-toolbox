import type { A } from 'ts-toolbelt'

import { DynamoDBToolboxError } from 'v1/errors'

import { Always, AtLeastOnce, Never } from '../constants'
import {
  $defaults,
  $elements,
  $hidden,
  $key,
  $required,
  $savedAs,
  $type,
} from '../constants/attributeOptions'
import { string } from '../primitive'
import type { $AnyOfAttributeState, AnyOfAttribute } from './interface'
import { anyOf } from './typer'

describe('anyOf', () => {
  const path = 'some.path'
  const str = string()

  it('rejects missing elements', () => {
    const invalidAnyOf = anyOf()

    const invalidCall = () => invalidAnyOf.freeze(path)

    expect(invalidCall).toThrow(DynamoDBToolboxError)
    expect(invalidCall).toThrow(
      expect.objectContaining({
        code: 'schema.anyOfAttribute.missingElements',
        path,
      }),
    )
  })

  it('rejects non-required elements', () => {
    const invalidAnyOf = anyOf(
      str,
      // @ts-expect-error
      str.optional(),
    )

    const invalidCall = () => invalidAnyOf.freeze(path)

    expect(invalidCall).toThrow(DynamoDBToolboxError)
    expect(invalidCall).toThrow(
      expect.objectContaining({
        code: 'schema.anyOfAttribute.optionalElements',
        path,
      }),
    )
  })

  it('rejects hidden elements', () => {
    const invalidAnyOf = anyOf(
      str,
      // @ts-expect-error
      str.hidden(),
    )

    const invalidCall = () => invalidAnyOf.freeze(path)

    expect(invalidCall).toThrow(DynamoDBToolboxError)
    expect(invalidCall).toThrow(
      expect.objectContaining({
        code: 'schema.anyOfAttribute.hiddenElements',
        path,
      }),
    )
  })

  it('rejects elements with savedAs values', () => {
    const invalidAnyOf = anyOf(
      str,
      // @ts-expect-error
      str.savedAs('foo'),
    )

    const invalidCall = () => invalidAnyOf.freeze(path)

    expect(invalidCall).toThrow(DynamoDBToolboxError)
    expect(invalidCall).toThrow(
      expect.objectContaining({
        code: 'schema.anyOfAttribute.savedAsElements',
        path,
      }),
    )
  })

  it('rejects elements with default values', () => {
    const invalidAnyOf = anyOf(
      str,
      // @ts-expect-error
      str.putDefault('foo'),
    )

    const invalidCall = () => invalidAnyOf.freeze(path)

    expect(invalidCall).toThrow(DynamoDBToolboxError)
    expect(invalidCall).toThrow(
      expect.objectContaining({
        code: 'schema.anyOfAttribute.defaultedElements',
        path,
      }),
    )
  })

  it('returns default anyOf', () => {
    const anyOfAttr = anyOf(str)

    const assertAnyOf: A.Contains<
      typeof anyOfAttr,
      {
        [$type]: 'anyOf'
        [$elements]: [typeof str]
        [$required]: AtLeastOnce
        [$hidden]: false
        [$key]: false
        [$savedAs]: undefined
        [$defaults]: {
          key: undefined
          put: undefined
          update: undefined
        }
      }
    > = 1
    assertAnyOf

    const assertExtends: A.Extends<typeof anyOfAttr, $AnyOfAttributeState> = 1
    assertExtends

    const frozenList = anyOfAttr.freeze(path)
    const assertFrozen: A.Extends<typeof frozenList, AnyOfAttribute> = 1
    assertFrozen

    expect(anyOfAttr).toMatchObject({
      [$type]: 'anyOf',
      [$elements]: [str],
      [$required]: 'atLeastOnce',
      [$key]: false,
      [$savedAs]: undefined,
      [$hidden]: false,
      [$defaults]: {
        key: undefined,
        put: undefined,
        update: undefined,
      },
    })
  })

  // TODO: Reimplement options as potential first argument
  // it('returns required anyOf (option)', () => {
  //   const anyOfAtLeastOnce = anyOf({ required: 'atLeastOnce' }, str)
  //   const anyOfAlways = anyOf({ required: 'always' }, str)
  //   const anyOfNever = anyOf({ required: 'never' }, str)

  //   const assertAtLeastOnce: A.Contains<typeof anyOfAtLeastOnce, { [$required]: AtLeastOnce }> = 1
  //   assertAtLeastOnce
  //   const assertAlways: A.Contains<typeof anyOfAlways, { [$required]: Always }> = 1
  //   assertAlways
  //   const assertNever: A.Contains<typeof anyOfNever, { [$required]: Never }> = 1
  //   assertNever

  //   expect(anyOfAtLeastOnce).toMatchObject({ [$required]: 'atLeastOnce' })
  //   expect(anyOfAlways).toMatchObject({ [$required]: 'always' })
  //   expect(anyOfNever).toMatchObject({ [$required]: 'never' })
  // })

  it('returns required anyOf (method)', () => {
    const anyOfAtLeastOnce = anyOf(str).required()
    const anyOfAlways = anyOf(str).required('always')
    const anyOfNever = anyOf(str).required('never')
    const anyOfOpt = anyOf(str).optional()

    const assertAtLeastOnce: A.Contains<
      typeof anyOfAtLeastOnce,
      { [$required]: AtLeastOnce }
    > = 1
    assertAtLeastOnce
    const assertAlways: A.Contains<
      typeof anyOfAlways,
      { [$required]: Always }
    > = 1
    assertAlways
    const assertNever: A.Contains<typeof anyOfNever, { [$required]: Never }> = 1
    assertNever
    const assertOpt: A.Contains<typeof anyOfOpt, { [$required]: Never }> = 1
    assertOpt

    expect(anyOfAtLeastOnce).toMatchObject({ [$required]: 'atLeastOnce' })
    expect(anyOfAlways).toMatchObject({ [$required]: 'always' })
    expect(anyOfNever).toMatchObject({ [$required]: 'never' })
  })

  // TODO: Reimplement options as potential first argument
  // it('returns hidden anyOf (option)', () => {
  //   const anyOfAttr = anyOf({ hidden: true }, str)

  //   const assertAnyOf: A.Contains<typeof anyOfAttr, { [$hidden]: true }> = 1
  //   assertAnyOf

  //   expect(anyOfAttr).toMatchObject({ [$hidden]: true })
  // })

  it('returns hidden anyOf (method)', () => {
    const anyOfAttr = anyOf(str).hidden()

    const assertAnyOf: A.Contains<typeof anyOfAttr, { [$hidden]: true }> = 1
    assertAnyOf

    expect(anyOfAttr).toMatchObject({ [$hidden]: true })
  })

  // TODO: Reimplement options as potential first argument
  // it('returns key anyOf (option)', () => {
  //   const anyOfAttr = anyOf({ key: true }, str)

  //   const assertAnyOf: A.Contains<typeof anyOfAttr, { [$key]: true; [$required]: AtLeastOnce }> = 1
  //   assertAnyOf

  //   expect(anyOfAttr).toMatchObject({ [$key]: true, [$required]: 'atLeastOnce' })
  // })

  it('returns key anyOf (method)', () => {
    const anyOfAttr = anyOf(str).key()

    const assertAnyOf: A.Contains<
      typeof anyOfAttr,
      { [$key]: true; [$required]: Always }
    > = 1
    assertAnyOf

    expect(anyOfAttr).toMatchObject({ [$key]: true, [$required]: 'always' })
  })

  // TODO: Reimplement options as potential first argument
  // it('returns savedAs anyOf (option)', () => {
  //   const anyOfAttr = anyOf({ savedAs: 'foo' }, str)

  //   const assertAnyOf: A.Contains<typeof anyOfAttr, { [$savedAs]: 'foo' }> = 1
  //   assertAnyOf

  //   expect(anyOfAttr).toMatchObject({ [$savedAs]: 'foo' })
  // })

  it('returns savedAs anyOf (method)', () => {
    const anyOfAttr = anyOf(str).savedAs('foo')

    const assertAnyOf: A.Contains<typeof anyOfAttr, { [$savedAs]: 'foo' }> = 1
    assertAnyOf

    expect(anyOfAttr).toMatchObject({ [$savedAs]: 'foo' })
  })

  // TODO: Reimplement options as potential first argument
  // it('returns defaulted anyOf (option)', () => {
  //   const anyOfAttr = anyOf(
  //     // TOIMPROVE: Add type constraints here
  //     { defaults: { key: undefined, put: 'foo', update: undefined } },
  //     str
  //   )

  //   const assertAnyOf: A.Contains<
  //     typeof anyOfAttr,
  //     { [$defaults]: { key: undefined; put: unknown; update: undefined } }
  //   > = 1
  //   assertAnyOf

  //   expect(anyOfAttr).toMatchObject({
  //     [$defaults]: { key: undefined, put: 'foo', update: undefined }
  //   })
  // })

  it('returns defaulted anyOf (method)', () => {
    const anyOfAttr = anyOf(str).updateDefault('bar')

    const assertAnyOf: A.Contains<
      typeof anyOfAttr,
      { [$defaults]: { key: undefined; put: undefined; update: unknown } }
    > = 1
    assertAnyOf

    expect(anyOfAttr).toMatchObject({
      [$defaults]: { key: undefined, put: undefined, update: 'bar' },
    })
  })

  it('returns anyOf with PUT default value if it is not key (default shorthand)', () => {
    const anyOfAttr = anyOf(str).default('foo')

    const assertAnyOf: A.Contains<
      typeof anyOfAttr,
      { [$defaults]: { key: undefined; put: unknown; update: undefined } }
    > = 1
    assertAnyOf

    expect(anyOfAttr).toMatchObject({
      [$defaults]: { key: undefined, put: 'foo', update: undefined },
    })
  })

  it('returns anyOf with KEY default value if it is key (default shorthand)', () => {
    const anyOfAttr = anyOf(str).key().default('foo')

    const assertAnyOf: A.Contains<
      typeof anyOfAttr,
      { [$defaults]: { key: unknown; put: undefined; update: undefined } }
    > = 1
    assertAnyOf

    expect(anyOfAttr).toMatchObject({
      [$defaults]: { key: 'foo', put: undefined, update: undefined },
    })
  })

  it('anyOf of anyOfs', () => {
    const nestedAnyOff = anyOf(str)
    const anyOfAttr = anyOf(nestedAnyOff)

    const assertAnyOf: A.Contains<
      typeof anyOfAttr,
      {
        [$type]: 'anyOf'
        [$elements]: [typeof nestedAnyOff]
        [$required]: AtLeastOnce
        [$hidden]: false
        [$key]: false
        [$savedAs]: undefined
        [$defaults]: {
          key: undefined
          put: undefined
          update: undefined
        }
      }
    > = 1
    assertAnyOf

    expect(anyOfAttr).toMatchObject({
      [$type]: 'anyOf',
      [$elements]: [nestedAnyOff],
      [$required]: 'atLeastOnce',
      [$hidden]: false,
      [$key]: false,
      [$savedAs]: undefined,
      [$defaults]: {
        key: undefined,
        put: undefined,
        update: undefined,
      },
    })
  })
})
