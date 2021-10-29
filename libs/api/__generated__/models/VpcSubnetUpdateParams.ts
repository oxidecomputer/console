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
 * Updateable properties of a [`VpcSubnet`]
 * @export
 * @interface VpcSubnetUpdateParams
 */
export interface VpcSubnetUpdateParams {
  /**
   *
   * @type {string}
   * @memberof VpcSubnetUpdateParams
   */
  description?: string | null
  /**
   *
   * @type {string}
   * @memberof VpcSubnetUpdateParams
   */
  ipv4Block?: string | null
  /**
   *
   * @type {string}
   * @memberof VpcSubnetUpdateParams
   */
  ipv6Block?: string | null
  /**
   *
   * @type {string}
   * @memberof VpcSubnetUpdateParams
   */
  name?: string | null
}

export function VpcSubnetUpdateParamsFromJSON(
  json: any
): VpcSubnetUpdateParams {
  return VpcSubnetUpdateParamsFromJSONTyped(json, false)
}

export function VpcSubnetUpdateParamsFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): VpcSubnetUpdateParams {
  if (json === undefined || json === null) {
    return json
  }
  return {
    description: !exists(json, 'description') ? undefined : json['description'],
    ipv4Block: !exists(json, 'ipv4Block') ? undefined : json['ipv4Block'],
    ipv6Block: !exists(json, 'ipv6Block') ? undefined : json['ipv6Block'],
    name: !exists(json, 'name') ? undefined : json['name'],
  }
}

export function VpcSubnetUpdateParamsToJSON(
  value?: VpcSubnetUpdateParams | null
): any {
  if (value === undefined) {
    return undefined
  }
  if (value === null) {
    return null
  }
  return {
    description: value.description,
    ipv4Block: value.ipv4Block,
    ipv6Block: value.ipv6Block,
    name: value.name,
  }
}
