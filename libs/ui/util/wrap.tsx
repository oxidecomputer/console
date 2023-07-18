/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import React from 'react'
import type { ReactElement, ReactNode } from 'react'

interface WrapProps {
  when: unknown
  with: ReactElement
  children: ReactNode
}

export const Wrap = (props: WrapProps) =>
  props.when ? React.cloneElement(props.with, [], props.children) : <>{props.children}</>
