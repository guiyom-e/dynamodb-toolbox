import type { NarrowObject } from 'v1/types/narrowObject'
import { overwrite } from 'v1/utils/overwrite'

import {
  $castAs,
  $defaults,
  $hidden,
  $key,
  $required,
  $savedAs,
  $type,
} from '../constants/attributeOptions'
import type { AtLeastOnce, RequiredOption } from '../constants/requiredOptions'
import type { InferStateFromOptions } from '../shared/inferStateFromOptions'
import { freezeAnyAttribute } from './freeze'
import type { $AnyAttribute } from './interface'
import {
  ANY_DEFAULT_OPTIONS,
  AnyAttributeDefaultOptions,
  AnyAttributeOptions,
} from './options'
import type { AnyAttributeState } from './types'

type $AnyAttributeTyper = <STATE extends AnyAttributeState = AnyAttributeState>(
  state: STATE,
) => $AnyAttribute<STATE>

const $any: $AnyAttributeTyper = <
  STATE extends AnyAttributeState = AnyAttributeState
>(
  state: STATE,
) => {
  const $anyAttribute: $AnyAttribute<STATE> = {
    [$type]: 'any',
    [$required]: state.required,
    [$hidden]: state.hidden,
    [$key]: state.key,
    [$savedAs]: state.savedAs,
    [$defaults]: state.defaults,
    [$castAs]: state.castAs,
    required: <NEXT_IS_REQUIRED extends RequiredOption = AtLeastOnce>(
      nextRequired: NEXT_IS_REQUIRED = 'atLeastOnce' as NEXT_IS_REQUIRED,
    ) => $any(overwrite(state, { required: nextRequired })),
    optional: () => $any(overwrite(state, { required: 'never' })),
    hidden: () => $any(overwrite(state, { hidden: true })),
    key: () => $any(overwrite(state, { key: true, required: 'always' })),
    savedAs: nextSavedAs => $any(overwrite(state, { savedAs: nextSavedAs })),
    castAs: <NEXT_CAST_AS>(
      nextCastAs = (undefined as unknown) as NEXT_CAST_AS,
    ) => $any(overwrite(state, { castAs: nextCastAs })),
    keyDefault: nextKeyDefault =>
      $any(
        overwrite(state, {
          defaults: {
            key: nextKeyDefault as unknown,
            put: state.defaults.put,
            update: state.defaults.update,
          },
        }),
      ),
    putDefault: nextPutDefault =>
      $any(
        overwrite(state, {
          defaults: {
            key: state.defaults.key,
            put: nextPutDefault as unknown,
            update: state.defaults.update,
          },
        }),
      ),
    updateDefault: nextUpdateDefault =>
      $any(
        overwrite(state, {
          defaults: {
            key: state.defaults.key,
            put: state.defaults.put,
            update: nextUpdateDefault as unknown,
          },
        }),
      ),
    default: nextDefault =>
      $any(
        overwrite(state, {
          defaults: state.key
            ? {
                key: nextDefault as unknown,
                put: state.defaults.put,
                update: state.defaults.update,
              }
            : {
                key: state.defaults.key,
                put: nextDefault as unknown,
                update: state.defaults.update,
              },
        }),
      ),
    keyLink: nextKeyDefault =>
      $any(
        overwrite(state, {
          defaults: {
            key: nextKeyDefault as unknown,
            put: state.defaults.put,
            update: state.defaults.update,
          },
        }),
      ),
    putLink: nextPutDefault =>
      $any(
        overwrite(state, {
          defaults: {
            key: state.defaults.key,
            put: nextPutDefault as unknown,
            update: state.defaults.update,
          },
        }),
      ),
    updateLink: nextUpdateDefault =>
      $any(
        overwrite(state, {
          defaults: {
            key: state.defaults.key,
            put: state.defaults.put,
            update: nextUpdateDefault as unknown,
          },
        }),
      ),
    link: nextDefault =>
      $any(
        overwrite(state, {
          defaults: state.key
            ? {
                key: nextDefault as unknown,
                put: state.defaults.put,
                update: state.defaults.update,
              }
            : {
                key: state.defaults.key,
                put: nextDefault as unknown,
                update: state.defaults.update,
              },
        }),
      ),
    freeze: path => freezeAnyAttribute(state, path),
  }

  return $anyAttribute
}

type AnyAttributeTyper = <
  OPTIONS extends Partial<AnyAttributeOptions> = AnyAttributeOptions
>(
  options?: NarrowObject<OPTIONS>,
) => $AnyAttribute<
  InferStateFromOptions<
    AnyAttributeOptions,
    AnyAttributeDefaultOptions,
    OPTIONS,
    { castAs: unknown }
  >
>

/**
 * Define a new attribute of any type
 *
 * @param options _(optional)_ Attribute Options
 */
export const any: AnyAttributeTyper = <
  OPTIONS extends Partial<AnyAttributeOptions> = AnyAttributeOptions
>(
  options?: NarrowObject<OPTIONS>,
) => {
  const state = {
    ...ANY_DEFAULT_OPTIONS,
    ...options,
    castAs: undefined,
    defaults: { ...ANY_DEFAULT_OPTIONS.defaults, ...options?.defaults },
  } as InferStateFromOptions<
    AnyAttributeOptions,
    AnyAttributeDefaultOptions,
    OPTIONS,
    { castAs: unknown }
  >

  return $any(state)
}
