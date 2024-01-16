import type { NarrowObject } from 'v1/types/narrowObject'
import { overwrite } from 'v1/utils/overwrite'

import type { AtLeastOnce, RequiredOption } from '../constants'
import {
  $attributes,
  $defaults,
  $hidden,
  $key,
  $required,
  $savedAs,
  $type,
} from '../constants/attributeOptions'
import type { InferStateFromOptions } from '../shared/inferStateFromOptions'
import type { SharedAttributeState } from '../shared/interface'
import { freezeMapAttribute } from './freeze'
import type { $MapAttribute } from './interface'
import {
  MAP_DEFAULT_OPTIONS,
  MapAttributeDefaultOptions,
  MapAttributeOptions,
} from './options'
import type { $MapAttributeAttributeStates } from './types'

type $MapAttributeTyper = <
  $ATTRIBUTES extends $MapAttributeAttributeStates,
  STATE extends SharedAttributeState = SharedAttributeState
>(
  attributes: NarrowObject<$ATTRIBUTES>,
  state: STATE,
) => $MapAttribute<$ATTRIBUTES, STATE>

const $map: $MapAttributeTyper = <
  $ATTRIBUTES extends $MapAttributeAttributeStates,
  STATE extends SharedAttributeState = SharedAttributeState
>(
  attributes: NarrowObject<$ATTRIBUTES>,
  state: STATE,
) => {
  const $mapAttribute: $MapAttribute<$ATTRIBUTES, STATE> = {
    [$type]: 'map',
    [$attributes]: attributes,
    [$required]: state.required,
    [$hidden]: state.hidden,
    [$key]: state.key,
    [$savedAs]: state.savedAs,
    [$defaults]: state.defaults,
    required: <NEXT_REQUIRED extends RequiredOption = AtLeastOnce>(
      nextRequired: NEXT_REQUIRED = ('atLeastOnce' as unknown) as NEXT_REQUIRED,
    ) => $map(attributes, overwrite(state, { required: nextRequired })),
    optional: () =>
      $map(attributes, overwrite(state, { required: 'never' as const })),
    hidden: () => $map(attributes, overwrite(state, { hidden: true as const })),
    key: () =>
      $map(
        attributes,
        overwrite(state, { required: 'always' as const, key: true as const }),
      ),
    savedAs: nextSavedAs =>
      $map(attributes, overwrite(state, { savedAs: nextSavedAs })),
    keyDefault: nextKeyDefault =>
      $map(
        attributes,
        overwrite(state, {
          defaults: {
            key: nextKeyDefault,
            put: state.defaults.put,
            update: state.defaults.update,
          },
        }),
      ),
    putDefault: nextPutDefault =>
      $map(
        attributes,
        overwrite(state, {
          defaults: {
            key: state.defaults.key,
            put: nextPutDefault,
            update: state.defaults.update,
          },
        }),
      ),
    updateDefault: nextUpdateDefault =>
      $map(
        attributes,
        overwrite(state, {
          defaults: {
            key: state.defaults.key,
            put: state.defaults.put,
            update: nextUpdateDefault,
          },
        }),
      ),
    default: nextDefault =>
      $map(
        attributes,
        overwrite(state, {
          defaults: state.key
            ? {
                key: nextDefault,
                put: state.defaults.put,
                update: state.defaults.update,
              }
            : {
                key: state.defaults.key,
                put: nextDefault,
                update: state.defaults.update,
              },
        }),
      ),
    keyLink: nextKeyDefault =>
      $map(
        attributes,
        overwrite(state, {
          defaults: {
            key: nextKeyDefault,
            put: state.defaults.put,
            update: state.defaults.update,
          },
        }),
      ),
    putLink: nextPutDefault =>
      $map(
        attributes,
        overwrite(state, {
          defaults: {
            key: state.defaults.key,
            put: nextPutDefault,
            update: state.defaults.update,
          },
        }),
      ),
    updateLink: nextUpdateDefault =>
      $map(
        attributes,
        overwrite(state, {
          defaults: {
            key: state.defaults.key,
            put: state.defaults.put,
            update: nextUpdateDefault,
          },
        }),
      ),
    link: nextDefault =>
      $map(
        attributes,
        overwrite(state, {
          defaults: state.key
            ? {
                key: nextDefault,
                put: state.defaults.put,
                update: state.defaults.update,
              }
            : {
                key: state.defaults.key,
                put: nextDefault,
                update: state.defaults.update,
              },
        }),
      ),
    freeze: path => freezeMapAttribute(attributes, state, path),
  }

  return $mapAttribute
}

type MapAttributeTyper = <
  ATTRIBUTES extends $MapAttributeAttributeStates,
  OPTIONS extends Partial<MapAttributeOptions> = MapAttributeDefaultOptions
>(
  attributes: NarrowObject<ATTRIBUTES>,
  options?: NarrowObject<OPTIONS>,
) => $MapAttribute<
  ATTRIBUTES,
  InferStateFromOptions<
    MapAttributeOptions,
    MapAttributeDefaultOptions,
    OPTIONS
  >
>

/**
 * Define a new map attribute
 *
 * @param attributes Dictionary of attributes
 * @param options _(optional)_ Map Options
 */
export const map: MapAttributeTyper = <
  ATTRIBUTES extends $MapAttributeAttributeStates,
  OPTIONS extends Partial<MapAttributeOptions> = MapAttributeDefaultOptions
>(
  attributes: NarrowObject<ATTRIBUTES>,
  options?: OPTIONS,
): $MapAttribute<
  ATTRIBUTES,
  InferStateFromOptions<
    MapAttributeOptions,
    MapAttributeDefaultOptions,
    OPTIONS
  >
> => {
  const state = {
    ...MAP_DEFAULT_OPTIONS,
    ...options,
    defaults: { ...MAP_DEFAULT_OPTIONS.defaults, ...options?.defaults },
  } as InferStateFromOptions<
    MapAttributeOptions,
    MapAttributeDefaultOptions,
    OPTIONS
  >

  return $map(attributes, state)
}
