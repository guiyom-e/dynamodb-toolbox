import type { ErrorBlueprint } from 'v1/errors/blueprint'

import type { AttributeErrorBlueprints } from './attributes/errors'

type DuplicateAttributeErrorBlueprint = ErrorBlueprint<{
  code: 'schema.duplicateAttributeNames'
  hasPath: false
  payload: { name: string }
}>

type DuplicateSavedAsErrorBlueprint = ErrorBlueprint<{
  code: 'schema.duplicateSavedAsAttributes'
  hasPath: false
  payload: { savedAs: string }
}>

export type SchemaErrorBlueprints =
  | AttributeErrorBlueprints
  | DuplicateAttributeErrorBlueprint
  | DuplicateSavedAsErrorBlueprint
