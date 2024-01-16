import type { AtLeastOnce } from '../constants'
import type {
  $defaults,
  $hidden,
  $required,
  $savedAs,
} from '../constants/attributeOptions'
import type { $AttributeNestedState, Attribute } from '../types'

export type $ListAttributeElements = $AttributeNestedState & {
  [$required]: AtLeastOnce
  [$hidden]: false
  [$savedAs]: undefined
  [$defaults]: {
    key: undefined
    put: undefined
    update: undefined
  }
}

export type ListAttributeElements = Attribute & {
  required: AtLeastOnce
  hidden: false
  savedAs: undefined
  defaults: {
    key: undefined
    put: undefined
    update: undefined
  }
}
