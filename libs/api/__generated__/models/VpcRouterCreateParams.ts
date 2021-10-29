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
 * Create-time parameters for a [`VpcRouter`]
 * @export
 * @interface VpcRouterCreateParams
 */
export interface VpcRouterCreateParams {
  /**
   *
   * @type {string}
   * @memberof VpcRouterCreateParams
   */
  description: string
  /**
   * Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'.
   * @type {string}
   * @memberof VpcRouterCreateParams
   */
  name: string
}

export function VpcRouterCreateParamsFromJSON(
  json: any
): VpcRouterCreateParams {
  return VpcRouterCreateParamsFromJSONTyped(json, false)
}

export function VpcRouterCreateParamsFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): VpcRouterCreateParams {
  if (json === undefined || json === null) {
    return json
  }
  return {
    description: json['description'],
    name: json['name'],
  }
}

export function VpcRouterCreateParamsToJSON(
  value?: VpcRouterCreateParams | null
): any {
  if (value === undefined) {
    return undefined
  }
  if (value === null) {
    return null
  }
  return {
    description: value.description,
    name: value.name,
  }
}
