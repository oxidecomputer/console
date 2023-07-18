/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Section } from '../../util/story-section'
import type { TagColor, TagVariant } from './Tag'
import { Tag, tagColors } from './Tag'

export const Default = () => {
  return (
    <main className="flex flex-wrap">
      <Section title="Normal">
        <div className="grid w-max grid-flow-col grid-cols-2 gap-x-6 gap-y-1">
          {Object.entries(tagColors).flatMap(([variant, colors], index) =>
            Object.keys(colors).map((color) => (
              <span key={`${variant}-${color}`} style={{ gridColumn: index + 1 }}>
                <Tag variant={variant as TagVariant} color={color as TagColor}>
                  {variant} {color}
                </Tag>
              </span>
            ))
          )}
        </div>
      </Section>
      <Section title="Narrow">
        <div className="grid w-max grid-flow-col grid-cols-2 gap-x-6">
          {Object.entries(tagColors).flatMap(([variant, colors], index) =>
            Object.keys(colors).map((color) => (
              <span key={`${variant}-${color}`} style={{ gridColumn: index + 1 }}>
                <Tag narrow variant={variant as TagVariant} color={color as TagColor}>
                  {variant} {color}
                </Tag>
              </span>
            ))
          )}
        </div>
      </Section>
      <Section title="Closable">
        <div className="grid w-max grid-flow-col grid-cols-2 gap-x-6 gap-y-1">
          {Object.entries(tagColors).flatMap(([variant, colors], index) =>
            Object.keys(colors).map((color) => (
              <span key={`${variant}-${color}`} style={{ gridColumn: index + 1 }}>
                <Tag
                  variant={variant as TagVariant}
                  color={color as TagColor}
                  onClose={() => {}}
                >
                  {variant} {color}
                </Tag>
              </span>
            ))
          )}
        </div>
      </Section>
      <Section title="Closable Narrow">
        <div className="grid w-max grid-flow-col grid-cols-2 gap-x-6">
          {Object.entries(tagColors).flatMap(([variant, colors], index) =>
            Object.keys(colors).map((color) => (
              <span key={`${variant}-${color}`} style={{ gridColumn: index + 1 }}>
                <Tag
                  narrow
                  variant={variant as TagVariant}
                  color={color as TagColor}
                  onClose={() => {}}
                >
                  {variant} {color}
                </Tag>
              </span>
            ))
          )}
        </div>
      </Section>
    </main>
  )
}

export const Selected = () => {
  return (
    <div className="is-selected -m-4 p-4 bg-accent-secondary">
      <Default />
    </div>
  )
}
