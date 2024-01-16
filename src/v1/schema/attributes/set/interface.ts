import type { O } from 'ts-toolbelt'

import type {
  AttributeKeyInput,
  AttributePutItemInput,
  AttributeUpdateItemInput,
  KeyInput,
  PutItemInput,
  UpdateItemInput,
} from 'v1/operations'
import type { If, ValueOrGetter } from 'v1/types'

import type { Schema } from '../../interface'
import type { $elements, $type } from '../constants/attributeOptions'
import type {
  Always,
  AtLeastOnce,
  Never,
  RequiredOption,
} from '../constants/requiredOptions'
import type {
  $SharedAttributeState,
  SharedAttributeState,
} from '../shared/interface'
import type { FreezeSetAttribute } from './freeze'
import type { $SetAttributeElements, SetAttributeElements } from './types'

export interface $SetAttributeState<
  $ELEMENTS extends $SetAttributeElements = $SetAttributeElements,
  STATE extends SharedAttributeState = SharedAttributeState
> extends $SharedAttributeState<STATE> {
  [$type]: 'set'
  [$elements]: $ELEMENTS
}

export interface $SetAttributeNestedState<
  $ELEMENTS extends $SetAttributeElements = $SetAttributeElements,
  STATE extends SharedAttributeState = SharedAttributeState
> extends $SetAttributeState<$ELEMENTS, STATE> {
  freeze: (
    path: string,
  ) => FreezeSetAttribute<$SetAttributeState<$ELEMENTS, STATE>>
}

/**
 * Set attribute interface
 */
export interface $SetAttribute<
  $ELEMENTS extends $SetAttributeElements = $SetAttributeElements,
  STATE extends SharedAttributeState = SharedAttributeState
> extends $SetAttributeNestedState<$ELEMENTS, STATE> {
  [$type]: 'set'
  [$elements]: $ELEMENTS
  /**
   * Tag attribute as required. Possible values are:
   * - `"atLeastOnce"` _(default)_: Required in PUTs, optional in UPDATEs
   * - `"never"`: Optional in PUTs and UPDATEs
   * - `"always"`: Required in PUTs and UPDATEs
   *
   * @param nextRequired RequiredOption
   */
  required: <NEXT_IS_REQUIRED extends RequiredOption = AtLeastOnce>(
    nextRequired?: NEXT_IS_REQUIRED,
  ) => $SetAttribute<
    $ELEMENTS,
    O.Overwrite<STATE, { required: NEXT_IS_REQUIRED }>
  >
  /**
   * Shorthand for `required('never')`
   */
  optional: () => $SetAttribute<
    $ELEMENTS,
    O.Overwrite<STATE, { required: Never }>
  >
  /**
   * Hide attribute after fetch commands and formatting
   */
  hidden: () => $SetAttribute<$ELEMENTS, O.Overwrite<STATE, { hidden: true }>>
  /**
   * Tag attribute as needed for Primary Key computing
   */
  key: () => $SetAttribute<
    $ELEMENTS,
    O.Overwrite<STATE, { key: true; required: Always }>
  >
  /**
   * Rename attribute before save commands
   */
  savedAs: <NEXT_SAVED_AS extends string | undefined>(
    nextSavedAs: NEXT_SAVED_AS,
  ) => $SetAttribute<$ELEMENTS, O.Overwrite<STATE, { savedAs: NEXT_SAVED_AS }>>
  /**
   * Provide a default value for attribute in Primary Key computing
   *
   * @param nextKeyDefault `keyAttributeInput | (() => keyAttributeInput)`
   */
  keyDefault: (
    nextKeyDefault: ValueOrGetter<
      AttributeKeyInput<
        FreezeSetAttribute<$SetAttributeState<$ELEMENTS, STATE>>,
        true
      >
    >,
  ) => $SetAttribute<
    $ELEMENTS,
    O.Overwrite<
      STATE,
      {
        defaults: {
          key: unknown
          put: STATE['defaults']['put']
          update: STATE['defaults']['update']
        }
      }
    >
  >
  /**
   * Provide a default value for attribute in PUT commands
   *
   * @param nextPutDefault `putAttributeInput | (() => putAttributeInput)`
   */
  putDefault: (
    nextPutDefault: ValueOrGetter<
      AttributePutItemInput<
        FreezeSetAttribute<$SetAttributeState<$ELEMENTS, STATE>>,
        true
      >
    >,
  ) => $SetAttribute<
    $ELEMENTS,
    O.Overwrite<
      STATE,
      {
        defaults: {
          key: STATE['defaults']['key']
          put: unknown
          update: STATE['defaults']['update']
        }
      }
    >
  >
  /**
   * Provide a default value for attribute in UPDATE commands
   *
   * @param nextUpdateDefault `updateAttributeInput | (() => updateAttributeInput)`
   */
  updateDefault: (
    nextUpdateDefault: ValueOrGetter<
      AttributeUpdateItemInput<
        FreezeSetAttribute<$SetAttributeState<$ELEMENTS, STATE>>,
        true
      >
    >,
  ) => $SetAttribute<
    $ELEMENTS,
    O.Overwrite<
      STATE,
      {
        defaults: {
          key: STATE['defaults']['key']
          put: STATE['defaults']['put']
          update: unknown
        }
      }
    >
  >
  /**
   * Provide a default value for attribute in PUT commands OR Primary Key computing if attribute is tagged as key
   *
   * @param nextDefault `key/putAttributeInput | (() => key/putAttributeInput)`
   */
  default: (
    nextDefault: ValueOrGetter<
      If<
        STATE['key'],
        AttributeKeyInput<
          FreezeSetAttribute<$SetAttributeState<$ELEMENTS, STATE>>,
          true
        >,
        AttributePutItemInput<
          FreezeSetAttribute<$SetAttributeState<$ELEMENTS, STATE>>,
          true
        >
      >
    >,
  ) => $SetAttribute<
    $ELEMENTS,
    O.Overwrite<
      STATE,
      {
        defaults: If<
          STATE['key'],
          {
            key: unknown
            put: STATE['defaults']['put']
            update: STATE['defaults']['update']
          },
          {
            key: STATE['defaults']['key']
            put: unknown
            update: STATE['defaults']['update']
          }
        >
      }
    >
  >
  /**
   * Provide a **linked** default value for attribute in Primary Key computing
   *
   * @param nextKeyDefault `keyAttributeInput | ((keyInput) => keyAttributeInput)`
   */
  keyLink: <SCHEMA extends Schema>(
    nextKeyDefault: ValueOrGetter<
      AttributeKeyInput<
        FreezeSetAttribute<$SetAttributeState<$ELEMENTS, STATE>>,
        true
      >,
      [KeyInput<SCHEMA, true>]
    >,
  ) => $SetAttribute<
    $ELEMENTS,
    O.Overwrite<
      STATE,
      {
        defaults: {
          key: unknown
          put: STATE['defaults']['put']
          update: STATE['defaults']['update']
        }
      }
    >
  >
  /**
   * Provide a **linked** default value for attribute in PUT commands
   *
   * @param nextPutDefault `putAttributeInput | ((putItemInput) => putAttributeInput)`
   */
  putLink: <SCHEMA extends Schema>(
    nextPutDefault: ValueOrGetter<
      AttributePutItemInput<
        FreezeSetAttribute<$SetAttributeState<$ELEMENTS, STATE>>,
        true
      >,
      [PutItemInput<SCHEMA, true>]
    >,
  ) => $SetAttribute<
    $ELEMENTS,
    O.Overwrite<
      STATE,
      {
        defaults: {
          key: STATE['defaults']['key']
          put: unknown
          update: STATE['defaults']['update']
        }
      }
    >
  >
  /**
   * Provide a **linked** default value for attribute in UPDATE commands
   *
   * @param nextUpdateDefault `unknown | ((updateItemInput) => updateAttributeInput)`
   */
  updateLink: <SCHEMA extends Schema>(
    nextUpdateDefault: ValueOrGetter<
      AttributeUpdateItemInput<
        FreezeSetAttribute<$SetAttributeState<$ELEMENTS, STATE>>,
        true
      >,
      [UpdateItemInput<SCHEMA, true>]
    >,
  ) => $SetAttribute<
    $ELEMENTS,
    O.Overwrite<
      STATE,
      {
        defaults: {
          key: STATE['defaults']['key']
          put: STATE['defaults']['put']
          update: unknown
        }
      }
    >
  >
  /**
   * Provide a **linked** default value for attribute in PUT commands OR Primary Key computing if attribute is tagged as key
   *
   * @param nextDefault `key/putAttributeInput | (() => key/putAttributeInput)`
   */
  link: <SCHEMA extends Schema>(
    nextDefault: ValueOrGetter<
      If<
        STATE['key'],
        AttributeKeyInput<
          FreezeSetAttribute<$SetAttributeState<$ELEMENTS, STATE>>,
          true
        >,
        AttributePutItemInput<
          FreezeSetAttribute<$SetAttributeState<$ELEMENTS, STATE>>,
          true
        >
      >,
      [If<STATE['key'], KeyInput<SCHEMA, true>, PutItemInput<SCHEMA, true>>]
    >,
  ) => $SetAttribute<
    $ELEMENTS,
    O.Overwrite<
      STATE,
      {
        defaults: If<
          STATE['key'],
          {
            key: unknown
            put: STATE['defaults']['put']
            update: STATE['defaults']['update']
          },
          {
            key: STATE['defaults']['key']
            put: unknown
            update: STATE['defaults']['update']
          }
        >
      }
    >
  >
}

export interface SetAttribute<
  ELEMENTS extends SetAttributeElements = SetAttributeElements,
  STATE extends SharedAttributeState = SharedAttributeState
> extends SharedAttributeState<STATE> {
  path: string
  type: 'set'
  elements: ELEMENTS
}
