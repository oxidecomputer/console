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
 * Client view of an [`ApiSled`]
 * @export
 * @interface ApiSledView
 */
export interface ApiSledView {
  /**
   * human-readable free-form text about a resource
   * @type {string}
   * @memberof ApiSledView
   */
  description: string
  /**
   * unique, immutable, system-controlled identifier for each resource
   * @type {string}
   * @memberof ApiSledView
   */
  id: string
  /**
   * Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'.
   * @type {string}
   * @memberof ApiSledView
   */
  name: string
  /**
   *
   * @type {string}
   * @memberof ApiSledView
   */
  serviceAddress: string
  /**
   * timestamp when this resource was created
   * @type {Date}
   * @memberof ApiSledView
   */
  timeCreated: Date
  /**
   * timestamp when this resource was last modified
   * @type {Date}
   * @memberof ApiSledView
   */
  timeModified: Date
}

export function ApiSledViewFromJSON(json: any): ApiSledView {
  return ApiSledViewFromJSONTyped(json, false)
}

export function ApiSledViewFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): ApiSledView {
  if (json === undefined || json === null) {
    return json
  }
  return {
    description: json['description'],
    id: json['id'],
    name: json['name'],
    serviceAddress: json['serviceAddress'],
    timeCreated: new Date(json['timeCreated']),
    timeModified: new Date(json['timeModified']),
  }
}

export function ApiSledViewToJSON(value?: ApiSledView | null): any {
  if (value === undefined) {
    return undefined
  }
  if (value === null) {
    return null
  }
  return {
    description: value.description,
    id: value.id,
    name: value.name,
    serviceAddress: value.serviceAddress,
    timeCreated: value.timeCreated.toISOString(),
    timeModified: value.timeModified.toISOString(),
  }
}
