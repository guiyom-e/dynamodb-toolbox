import type { NativeAttributeValue } from '@aws-sdk/util-dynamodb'

import type { Attribute, Schema } from 'v1/schema'
import { isArray } from 'v1/utils/validation/isArray'
import { isObject } from 'v1/utils/validation/isObject'

import {
  $ADD,
  $APPEND,
  $DELETE,
  $PREPEND,
  $REMOVE,
  $SET,
  $SUBTRACT,
  $SUM,
} from '../constants'
import type { AttributeUpdateItemInput, UpdateItemInput } from '../types'
import {
  hasAddOperation,
  hasAppendOperation,
  hasDeleteOperation,
  hasGetOperation,
  hasPrependOperation,
  hasSetOperation,
  hasSubtractOperation,
  hasSumOperation,
} from '../utils'
import type { ParsedUpdate } from './type'
import { UpdateExpressionVerbParser } from './verbParser'

export class UpdateExpressionParser {
  schema: Schema | Attribute
  set: UpdateExpressionVerbParser
  remove: UpdateExpressionVerbParser
  add: UpdateExpressionVerbParser
  delete: UpdateExpressionVerbParser

  constructor(schema: Schema | Attribute) {
    this.schema = schema
    this.set = new UpdateExpressionVerbParser(schema, 's')
    this.remove = new UpdateExpressionVerbParser(schema, 'r')
    this.add = new UpdateExpressionVerbParser(schema, 'a')
    this.delete = new UpdateExpressionVerbParser(schema, 'd')
  }

  parseUpdate = (
    input: UpdateItemInput | AttributeUpdateItemInput,
    currentPath: (string | number)[] = [],
  ): void => {
    if (input === undefined) {
      return
    }

    if (hasSetOperation(input)) {
      this.set.beginNewInstruction()
      this.set.appendValidAttributePath(currentPath)
      this.set.appendToExpression(' = ')
      this.set.appendValidAttributeValue(input[$SET])
      return
    }

    if (hasGetOperation(input)) {
      this.set.beginNewInstruction()
      this.set.appendValidAttributePath(currentPath)
      this.set.appendToExpression(' = ')
      this.set.appendValidAttributeValue(input)
      return
    }

    if (input === $REMOVE) {
      this.remove.beginNewInstruction()
      this.remove.appendValidAttributePath(currentPath)
      return
    }

    if (hasSumOperation(input)) {
      const [a, b] = input[$SUM]
      this.set.beginNewInstruction()
      this.set.appendValidAttributePath(currentPath)
      this.set.appendToExpression(' = ')
      this.set.appendValidAttributeValue(a)
      this.set.appendToExpression(' + ')
      this.set.appendValidAttributeValue(b)
      return
    }

    if (hasSubtractOperation(input)) {
      const [a, b] = input[$SUBTRACT]
      this.set.beginNewInstruction()
      this.set.appendValidAttributePath(currentPath)
      this.set.appendToExpression(' = ')
      this.set.appendValidAttributeValue(a)
      this.set.appendToExpression(' - ')
      this.set.appendValidAttributeValue(b)
      return
    }

    if (hasAddOperation(input)) {
      this.add.beginNewInstruction()
      this.add.appendValidAttributePath(currentPath)
      this.add.appendToExpression(' ')
      this.add.appendValidAttributeValue(input[$ADD])
      return
    }

    if (hasDeleteOperation(input)) {
      this.delete.beginNewInstruction()
      this.delete.appendValidAttributePath(currentPath)
      this.delete.appendToExpression(' ')
      this.delete.appendValidAttributeValue(input[$DELETE])
      return
    }

    if (hasAppendOperation(input)) {
      this.set.beginNewInstruction()
      this.set.appendValidAttributePath(currentPath)
      this.set.appendToExpression(' = list_append(')
      this.set.appendValidAttributePath(currentPath)
      this.set.appendToExpression(', ')
      this.set.appendValidAttributeValue(input[$APPEND])
      this.set.appendToExpression(')')
      return
    }

    if (hasPrependOperation(input)) {
      this.set.beginNewInstruction()
      this.set.appendValidAttributePath(currentPath)
      this.set.appendToExpression(' = list_append(')
      this.set.appendValidAttributeValue(input[$PREPEND])
      this.set.appendToExpression(', ')
      this.set.appendValidAttributePath(currentPath)
      this.set.appendToExpression(')')
      return
    }

    if (isObject(input)) {
      for (const [key, value] of Object.entries(input)) {
        this.parseUpdate(value, [...currentPath, key])
      }
      return
    }

    if (isArray(input)) {
      input.forEach((element, index) => {
        if (element === undefined) {
          return
        }

        this.parseUpdate(element, [...currentPath, index])
      })

      return
    }

    this.set.beginNewInstruction()
    this.set.appendValidAttributePath(currentPath)
    this.set.appendToExpression(' = ')
    this.set.appendValidAttributeValue(input)
  }

  toCommandOptions = (): ParsedUpdate => {
    let UpdateExpression = ''
    const ExpressionAttributeNames: Record<string, string> = {}
    const ExpressionAttributeValues: Record<string, NativeAttributeValue> = {}

    for (const [verb, parser] of [
      ['SET', this.set],
      ['REMOVE', this.remove],
      ['ADD', this.add],
      ['DELETE', this.delete],
    ] as const) {
      const verbCommandOptions = parser.toCommandOptions()

      if (verbCommandOptions.UpdateExpression === '') {
        continue
      }

      if (UpdateExpression !== '') {
        UpdateExpression += ' '
      }
      UpdateExpression += verb
      UpdateExpression += ' '
      UpdateExpression += verbCommandOptions.UpdateExpression

      Object.assign(
        ExpressionAttributeNames,
        verbCommandOptions.ExpressionAttributeNames,
      )
      Object.assign(
        ExpressionAttributeValues,
        verbCommandOptions.ExpressionAttributeValues,
      )
    }

    return {
      UpdateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
    }
  }
}
