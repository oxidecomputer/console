/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Checkbox } from '../checkbox/Checkbox'
import { CheckboxGroup } from './CheckboxGroup'

export const Default = () => (
  <CheckboxGroup name="group1">
    <Checkbox value="notify">Comments</Checkbox>
    <Checkbox value="do-not-notify">Nothing</Checkbox>
  </CheckboxGroup>
)

export const DefaultColumn = () => (
  <CheckboxGroup name="group2" column>
    <Checkbox value="50">50 GB</Checkbox>
    <Checkbox value="100">100 GB</Checkbox>
    <Checkbox value="200">200 GB</Checkbox>
    <Checkbox value="300">300 GB</Checkbox>
    <Checkbox value="400">400 GB</Checkbox>
    <Checkbox value="500">500 GB</Checkbox>
    <Checkbox value="600">600 GB</Checkbox>
  </CheckboxGroup>
)

export const Disabled = () => (
  <CheckboxGroup name="group4" disabled>
    <Checkbox value="50">50 GB</Checkbox>
    <Checkbox value="100">100 GB</Checkbox>
    <Checkbox value="200">200 GB</Checkbox>
    <Checkbox value="300">300 GB</Checkbox>
    <Checkbox value="400">400 GB</Checkbox>
    <Checkbox value="500">500 GB</Checkbox>
    <Checkbox value="600">600 GB</Checkbox>
  </CheckboxGroup>
)
