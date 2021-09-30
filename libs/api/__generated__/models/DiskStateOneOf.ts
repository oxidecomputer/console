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
/**
 * Disk is being initialized
 * @export
 * @interface DiskStateOneOf
 */
export interface DiskStateOneOf {
  /**
   *
   * @type {string}
   * @memberof DiskStateOneOf
   */
  state: 'creating'
}

export function DiskStateOneOfFromJSON(json: any): DiskStateOneOf {
  return DiskStateOneOfFromJSONTyped(json, false)
}

export function DiskStateOneOfFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): DiskStateOneOf {
  if (json === undefined || json === null) {
    return json
  }
  return {
    state: json['state'],
  }
}

export function DiskStateOneOfToJSON(value?: DiskStateOneOf | null): any {
  if (value === undefined) {
    return undefined
  }
  if (value === null) {
    return null
  }
  return {
    state: value.state,
  }
}
