import type { A } from 'ts-toolbelt'

import { Always, AtLeastOnce, Never } from '../constants'
import {
  $attributes,
  $defaults,
  $hidden,
  $key,
  $required,
  $savedAs,
  $type,
} from '../constants/attributeOptions'
import { string } from '../primitive'
import type { $MapAttributeState, MapAttribute } from './interface'
import { map } from './typer'

describe('map', () => {
  const str = string()

  it('returns default map', () => {
    const mapped = map({ str })

    const assertMapAttribute: A.Contains<
      typeof mapped,
      {
        [$type]: 'map'
        [$attributes]: {
          str: typeof str
        }
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
    assertMapAttribute

    const assertExtends: A.Extends<typeof mapped, $MapAttributeState> = 1
    assertExtends

    const frozenMap = mapped.freeze('some.path')
    const assertFrozenExtends: A.Extends<typeof frozenMap, MapAttribute> = 1
    assertFrozenExtends

    expect(mapped).toMatchObject({
      [$type]: 'map',
      [$attributes]: { str },
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

  it('returns required map (option)', () => {
    const mappedAtLeastOnce = map({ str }, { required: 'atLeastOnce' })
    const mappedAlways = map({ str }, { required: 'always' })
    const mappedNever = map({ str }, { required: 'never' })

    const assertMapAttributeAtLeastOnce: A.Contains<
      typeof mappedAtLeastOnce,
      { [$required]: AtLeastOnce }
    > = 1
    assertMapAttributeAtLeastOnce
    const assertMapAttributeAlways: A.Contains<
      typeof mappedAlways,
      { [$required]: Always }
    > = 1
    assertMapAttributeAlways
    const assertMapAttributeNever: A.Contains<
      typeof mappedNever,
      { [$required]: Never }
    > = 1
    assertMapAttributeNever

    expect(mappedAtLeastOnce).toMatchObject({ [$required]: 'atLeastOnce' })
    expect(mappedAlways).toMatchObject({ [$required]: 'always' })
    expect(mappedNever).toMatchObject({ [$required]: 'never' })
  })

  it('returns required map (method)', () => {
    const mappedAtLeastOnce = map({ str }).required()
    const mappedAlways = map({ str }).required('always')
    const mappedNever = map({ str }).required('never')
    const mappedOpt = map({ str }).optional()

    const assertMapAttributeAtLeastOnce: A.Contains<
      typeof mappedAtLeastOnce,
      { [$required]: AtLeastOnce }
    > = 1
    assertMapAttributeAtLeastOnce
    const assertMapAttributeAlways: A.Contains<
      typeof mappedAlways,
      { [$required]: Always }
    > = 1
    assertMapAttributeAlways
    const assertMapAttributeNever: A.Contains<
      typeof mappedNever,
      { [$required]: Never }
    > = 1
    assertMapAttributeNever
    const assertMapAttributeOpt: A.Contains<
      typeof mappedOpt,
      { [$required]: Never }
    > = 1
    assertMapAttributeOpt

    expect(mappedAtLeastOnce).toMatchObject({ [$required]: 'atLeastOnce' })
    expect(mappedAlways).toMatchObject({ [$required]: 'always' })
    expect(mappedNever).toMatchObject({ [$required]: 'never' })
    expect(mappedOpt).toMatchObject({ [$required]: 'never' })
  })

  it('returns hidden map (option)', () => {
    const mapped = map({ str }, { hidden: true })

    const assertMapAttribute: A.Contains<typeof mapped, { [$hidden]: true }> = 1
    assertMapAttribute

    expect(mapped).toMatchObject({ [$hidden]: true })
  })

  it('returns hidden map (method)', () => {
    const mapped = map({ str }).hidden()

    const assertMapAttribute: A.Contains<typeof mapped, { [$hidden]: true }> = 1
    assertMapAttribute

    expect(mapped).toMatchObject({ [$hidden]: true })
  })

  it('returns key map (option)', () => {
    const mapped = map({ str }, { key: true })

    const assertMapAttribute: A.Contains<
      typeof mapped,
      { [$key]: true; [$required]: AtLeastOnce }
    > = 1
    assertMapAttribute

    expect(mapped).toMatchObject({ [$key]: true, [$required]: 'atLeastOnce' })
  })

  it('returns key map (method)', () => {
    const mapped = map({ str }).key()

    const assertMapAttribute: A.Contains<
      typeof mapped,
      { [$key]: true; [$required]: Always }
    > = 1
    assertMapAttribute

    expect(mapped).toMatchObject({ [$key]: true, [$required]: 'always' })
  })

  it('returns savedAs map (option)', () => {
    const mapped = map({ str }, { savedAs: 'foo' })

    const assertMapAttribute: A.Contains<
      typeof mapped,
      { [$savedAs]: 'foo' }
    > = 1
    assertMapAttribute

    expect(mapped).toMatchObject({ [$savedAs]: 'foo' })
  })

  it('returns savedAs map (method)', () => {
    const mapped = map({ str }).savedAs('foo')

    const assertMapAttribute: A.Contains<
      typeof mapped,
      { [$savedAs]: 'foo' }
    > = 1
    assertMapAttribute

    expect(mapped).toMatchObject({ [$savedAs]: 'foo' })
  })

  it('returns defaulted map (option)', () => {
    const mapA = map(
      { str },
      // TOIMPROVE: Try to add type constraints here
      { defaults: { key: { str: 'foo' }, put: undefined, update: undefined } },
    )

    const assertMapAttribute: A.Contains<
      typeof mapA,
      { [$defaults]: { key: unknown; put: undefined; update: undefined } }
    > = 1
    assertMapAttribute

    expect(mapA).toMatchObject({
      [$defaults]: { key: { str: 'foo' }, put: undefined, update: undefined },
    })

    const mapB = map(
      { str },
      // TOIMPROVE: Try to add type constraints here
      { defaults: { key: undefined, put: { str: 'bar' }, update: undefined } },
    )

    const assertMapB: A.Contains<
      typeof mapB,
      { [$defaults]: { key: undefined; put: unknown; update: undefined } }
    > = 1
    assertMapB

    expect(mapB).toMatchObject({
      [$defaults]: { key: undefined, put: { str: 'bar' }, update: undefined },
    })

    const mapC = map(
      { str },
      { defaults: { key: undefined, put: undefined, update: { str: 'baz' } } },
    )

    const assertMapC: A.Contains<
      typeof mapC,
      { [$defaults]: { key: undefined; put: undefined; update: unknown } }
    > = 1
    assertMapC

    expect(mapC).toMatchObject({
      [$defaults]: { key: undefined, put: undefined, update: { str: 'baz' } },
    })
  })

  it('returns defaulted map (method)', () => {
    const mapA = map({ str }).key().keyDefault({ str: 'foo' })

    const assertMapAttribute: A.Contains<
      typeof mapA,
      { [$defaults]: { key: unknown; put: undefined; update: undefined } }
    > = 1
    assertMapAttribute

    expect(mapA).toMatchObject({
      [$defaults]: { key: { str: 'bar' }, put: undefined, update: undefined },
    })

    const mapB = map({ str }).putDefault({ str: 'bar' })

    const assertMapB: A.Contains<
      typeof mapB,
      { [$defaults]: { key: undefined; put: unknown; update: undefined } }
    > = 1
    assertMapB

    expect(mapB).toMatchObject({
      [$defaults]: { key: undefined, put: { str: 'bar' }, update: undefined },
    })

    const mapC = map({ str }).updateDefault({ str: 'baz' })

    const assertMapC: A.Contains<
      typeof mapC,
      { [$defaults]: { key: undefined; put: undefined; update: unknown } }
    > = 1
    assertMapC

    expect(mapC).toMatchObject({
      [$defaults]: { key: undefined, put: undefined, update: { str: 'baz' } },
    })
  })

  it('returns map with PUT default value if it is not key (default shorthand)', () => {
    const mapAttr = map({ str }).default({ str: 'foo' })

    const assertMap: A.Contains<
      typeof mapAttr,
      { [$defaults]: { key: undefined; put: unknown; update: undefined } }
    > = 1
    assertMap

    expect(mapAttr).toMatchObject({
      [$defaults]: { key: undefined, put: { str: 'foo' }, update: undefined },
    })
  })

  it('returns map with KEY default value if it is key (default shorthand)', () => {
    const mapAttr = map({ str }).key().default({ str: 'bar' })

    const assertMap: A.Contains<
      typeof mapAttr,
      { [$defaults]: { key: unknown; put: undefined; update: undefined } }
    > = 1
    assertMap

    expect(mapAttr).toMatchObject({
      [$defaults]: { key: { str: 'bar' }, put: undefined, update: undefined },
    })
  })

  it('nested map', () => {
    const mapped = map({
      nested: map({
        nestedAgain: map({
          str,
        }).hidden(),
      }),
    })

    const assertMapAttribute: A.Contains<
      typeof mapped,
      {
        [$type]: 'map'
        [$attributes]: {
          nested: {
            [$type]: 'map'
            [$attributes]: {
              nestedAgain: {
                [$type]: 'map'
                [$attributes]: {
                  str: typeof str
                }
                [$required]: AtLeastOnce
                [$hidden]: true
                [$key]: false
                [$savedAs]: undefined
                [$defaults]: {
                  key: undefined
                  put: undefined
                  update: undefined
                }
              }
            }
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
        }
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
    assertMapAttribute

    expect(mapped).toMatchObject({
      [$type]: 'map',
      [$attributes]: {
        nested: {
          [$type]: 'map',
          [$attributes]: {
            nestedAgain: {
              [$type]: 'map',
              [$attributes]: {
                str,
              },
              [$required]: 'atLeastOnce',
              [$hidden]: true,
              [$key]: false,
              [$savedAs]: undefined,
              [$defaults]: {
                key: undefined,
                put: undefined,
                update: undefined,
              },
            },
          },
          [$required]: 'atLeastOnce',
          [$hidden]: false,
          [$key]: false,
          [$savedAs]: undefined,
          [$defaults]: {
            key: undefined,
            put: undefined,
            update: undefined,
          },
        },
      },
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
