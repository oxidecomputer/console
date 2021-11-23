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

import {
  RouteDestinationOneOf1,
  RouteDestinationOneOf2,
  RouteTargetOneOf,
  RouteDestinationOneOf1FromJSONTyped,
  RouteDestinationOneOf1ToJSON,
  RouteDestinationOneOf2FromJSONTyped,
  RouteDestinationOneOf2ToJSON,
  RouteTargetOneOfFromJSONTyped,
  RouteTargetOneOfToJSON,
} from './'

/**
 * @type VpcFirewallRuleTarget
 * A subset of [`NetworkTarget`], `VpcFirewallRuleTarget` specifies all possible targets that a firewall rule can be attached to.
 * @export
 */
export type VpcFirewallRuleTarget =
  | RouteDestinationOneOf1
  | RouteDestinationOneOf2
  | RouteTargetOneOf

export function VpcFirewallRuleTargetFromJSON(
  json: any
): VpcFirewallRuleTarget {
  return VpcFirewallRuleTargetFromJSONTyped(json, false)
}

export function VpcFirewallRuleTargetFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): VpcFirewallRuleTarget {
  if (json === undefined || json === null) {
    return json
  }
  return {
    ...RouteDestinationOneOf1FromJSONTyped(json, true),
    ...RouteDestinationOneOf2FromJSONTyped(json, true),
    ...RouteTargetOneOfFromJSONTyped(json, true),
  }
}

export function VpcFirewallRuleTargetToJSON(
  value?: VpcFirewallRuleTarget | null
): any {
  if (value === undefined) {
    return undefined
  }
  if (value === null) {
    return null
  }
  return {
    ...RouteDestinationOneOf1ToJSON(value),
    ...RouteDestinationOneOf2ToJSON(value),
    ...RouteTargetOneOfToJSON(value),
  }
}
