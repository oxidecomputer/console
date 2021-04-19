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
  ApiInstanceState,
  ApiInstanceStateFromJSON,
  ApiInstanceStateFromJSONTyped,
  ApiInstanceStateToJSON,
} from './'

/**
 * Client view of an [`ApiInstance`]
 * @export
 * @interface ApiInstanceView
 */
export interface ApiInstanceView {
  /**
   * human-readable free-form text about a resource
   * @type {string}
   * @memberof ApiInstanceView
   */
  description: string
  /**
   * RFC1035-compliant hostname for the Instance.
   * @type {string}
   * @memberof ApiInstanceView
   */
  hostname: string
  /**
   * unique, immutable, system-controlled identifier for each resource
   * @type {string}
   * @memberof ApiInstanceView
   */
  id: string
  /**
   * A count of bytes, typically used either for memory or storage capacity
   *
   * The maximum supported byte count is [`i64::MAX`].  This makes it somewhat inconvenient to define constructors: a u32 constructor can be infallible, but an i64 constructor can fail (if the value is negative) and a u64 constructor can fail (if the value is larger than i64::MAX).  We provide all of these for consumers' convenience.
   * @type {number}
   * @memberof ApiInstanceView
   */
  memory: number
  /**
   * Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'.
   * @type {string}
   * @memberof ApiInstanceView
   */
  name: string
  /**
   * The number of CPUs in an Instance
   * @type {number}
   * @memberof ApiInstanceView
   */
  ncpus: number
  /**
   * id for the project containing this Instance
   * @type {string}
   * @memberof ApiInstanceView
   */
  projectId: string
  /**
   *
   * @type {ApiInstanceState}
   * @memberof ApiInstanceView
   */
  runState: ApiInstanceState
  /**
   * timestamp when this resource was created
   * @type {Date}
   * @memberof ApiInstanceView
   */
  timeCreated: Date
  /**
   * timestamp when this resource was last modified
   * @type {Date}
   * @memberof ApiInstanceView
   */
  timeModified: Date
  /**
   *
   * @type {Date}
   * @memberof ApiInstanceView
   */
  timeRunStateUpdated: Date
}

export function ApiInstanceViewFromJSON(json: any): ApiInstanceView {
  return ApiInstanceViewFromJSONTyped(json, false)
}

export function ApiInstanceViewFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): ApiInstanceView {
  if (json === undefined || json === null) {
    return json
  }
  return {
    description: json['description'],
    hostname: json['hostname'],
    id: json['id'],
    memory: json['memory'],
    name: json['name'],
    ncpus: json['ncpus'],
    projectId: json['projectId'],
    runState: ApiInstanceStateFromJSON(json['runState']),
    timeCreated: new Date(json['timeCreated']),
    timeModified: new Date(json['timeModified']),
    timeRunStateUpdated: new Date(json['timeRunStateUpdated']),
  }
}

export function ApiInstanceViewToJSON(value?: ApiInstanceView | null): any {
  if (value === undefined) {
    return undefined
  }
  if (value === null) {
    return null
  }
  return {
    description: value.description,
    hostname: value.hostname,
    id: value.id,
    memory: value.memory,
    name: value.name,
    ncpus: value.ncpus,
    projectId: value.projectId,
    runState: ApiInstanceStateToJSON(value.runState),
    timeCreated: value.timeCreated.toISOString(),
    timeModified: value.timeModified.toISOString(),
    timeRunStateUpdated: value.timeRunStateUpdated.toISOString(),
  }
}
