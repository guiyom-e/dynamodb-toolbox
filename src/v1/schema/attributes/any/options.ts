import { AtLeastOnce, RequiredOption } from '../constants/requiredOptions'

// Note: May look like a duplicate of AnyAttributeState but actually adds JSDocs

export interface AnyAttributeOptions {
  /**
   * Tag attribute as required. Possible values are:
   * - `"atLeastOnce"` _(default)_: Required in PUTs, optional in UPDATEs
   * - `"never"`: Optional in PUTs and UPDATEs
   * - `"always"`: Required in PUTs and UPDATEs
   */
  required: RequiredOption
  /**
   * Hide attribute after fetch commands and formatting
   */
  hidden: boolean
  /**
   * Tag attribute as needed for Primary Key computing
   */
  key: boolean
  /**
   * Rename attribute before save commands
   */
  savedAs: string | undefined
  /**
   * Provide default values for attribute
   */
  defaults: {
    key: undefined | unknown
    put: undefined | unknown
    update: undefined | unknown
  }
}

export type AnyAttributeDefaultOptions = {
  required: AtLeastOnce
  hidden: false
  key: false
  savedAs: undefined
  defaults: {
    key: undefined
    put: undefined
    update: undefined
  }
}

export const ANY_DEFAULT_OPTIONS: AnyAttributeDefaultOptions = {
  required: 'atLeastOnce',
  hidden: false,
  key: false,
  savedAs: undefined,
  defaults: {
    key: undefined,
    put: undefined,
    update: undefined,
  },
}
