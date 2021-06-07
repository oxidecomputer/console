/* tslint:disable */
/* eslint-disable */
/**
 * Oxide Region API
 * API for interacting with the Oxide control plane
 *
 * The version of the OpenAPI document: 0.0.1
 * Contact: api@oxide.computer
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime'
import {
  ActionErrorAnyOf2DeserializeFailed,
  ActionErrorAnyOf2DeserializeFailedFromJSON,
  ActionErrorAnyOf2DeserializeFailedFromJSONTyped,
  ActionErrorAnyOf2DeserializeFailedToJSON,
} from './'

/**
 * The framework failed to create the requested subsaga
 * @export
 * @interface ActionErrorAnyOf4
 */
export interface ActionErrorAnyOf4 {
  /**
   *
   * @type {ActionErrorAnyOf2DeserializeFailed}
   * @memberof ActionErrorAnyOf4
   */
  subsagaCreateFailed: ActionErrorAnyOf2DeserializeFailed
}

export function ActionErrorAnyOf4FromJSON(json: any): ActionErrorAnyOf4 {
  return ActionErrorAnyOf4FromJSONTyped(json, false)
}

export function ActionErrorAnyOf4FromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): ActionErrorAnyOf4 {
  if (json === undefined || json === null) {
    return json
  }
  return {
    subsagaCreateFailed: ActionErrorAnyOf2DeserializeFailedFromJSON(
      json['SubsagaCreateFailed']
    ),
  }
}

export function ActionErrorAnyOf4ToJSON(value?: ActionErrorAnyOf4 | null): any {
  if (value === undefined) {
    return undefined
  }
  if (value === null) {
    return null
  }
  return {
    SubsagaCreateFailed: ActionErrorAnyOf2DeserializeFailedToJSON(
      value.subsagaCreateFailed
    ),
  }
}
