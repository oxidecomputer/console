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
 * @interface DiskStateAnyOf
 */
export interface DiskStateAnyOf {
  /**
   *
   * @type {string}
   * @memberof DiskStateAnyOf
   */
  state: DiskStateAnyOfStateEnum
}

/**
 * @export
 * @enum {string}
 */
export enum DiskStateAnyOfStateEnum {
  Creating = 'creating',
}

export function DiskStateAnyOfFromJSON(json: any): DiskStateAnyOf {
  return DiskStateAnyOfFromJSONTyped(json, false)
}

export function DiskStateAnyOfFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): DiskStateAnyOf {
  if (json === undefined || json === null) {
    return json
  }
  return {
    state: json['state'],
  }
}

export function DiskStateAnyOfToJSON(value?: DiskStateAnyOf | null): any {
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
