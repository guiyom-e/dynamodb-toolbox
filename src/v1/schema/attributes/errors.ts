import type { AnyOfAttributeErrorBlueprints } from './anyOf/errors'
import type { ListAttributeErrorBlueprints } from './list/errors'
import type { MapAttributeErrorBlueprints } from './map/errors'
import type { PrimitiveAttributeErrorBlueprints } from './primitive/errors'
import type { RecordAttributeErrorBlueprints } from './record/errors'
import type { SetAttributeErrorBlueprints } from './set/errors'
import type { SharedAttributeErrorBlueprints } from './shared/errors'

export type AttributeErrorBlueprints =
  | PrimitiveAttributeErrorBlueprints
  | SetAttributeErrorBlueprints
  | ListAttributeErrorBlueprints
  | MapAttributeErrorBlueprints
  | RecordAttributeErrorBlueprints
  | AnyOfAttributeErrorBlueprints
  | SharedAttributeErrorBlueprints
