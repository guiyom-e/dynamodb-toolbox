import type { AtLeastOnce } from '../constants'
import type {
  $defaults,
  $hidden,
  $required,
  $savedAs,
} from '../constants/attributeOptions'
import type { $AttributeNestedState, Attribute } from '../types'

export type $AnyOfAttributeElements = $AttributeNestedState & {
  [$required]: AtLeastOnce
  [$hidden]: false
  [$savedAs]: undefined
  [$defaults]: {
    key: undefined
    put: undefined
    update: undefined
  }
}

export type AnyOfAttributeElements = Attribute & {
  required: AtLeastOnce
  hidden: false
  savedAs: undefined
  defaults: {
    key: undefined
    put: undefined
    update: undefined
  }
}
