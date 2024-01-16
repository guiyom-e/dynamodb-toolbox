import { isBinary } from './isBinary'
import { isBoolean } from './isBoolean'
import { isNumber } from './isNumber'
import { isString } from './isString'

export const isPrimitive = (
  candidate: unknown,
): candidate is boolean | number | string | Buffer =>
  isString(candidate) ||
  isNumber(candidate) ||
  isBoolean(candidate) ||
  isBinary(candidate)
