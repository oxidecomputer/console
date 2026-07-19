/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { classed } from '~/util/classed'

/**
 * Secondary line in a combobox or listbox item label, e.g., a description or
 * metadata shown under the item name. The `selected:` variant keeps the text
 * legible against the accent background of the highlighted option. User-supplied
 * descriptions can be arbitrarily long, so clamp at two lines to keep option
 * heights bounded, and break long unbroken tokens (like URLs) so they wrap
 * instead of overflowing. Content must be inline (no flex/block children) or
 * the line clamp won't apply.
 */
export const ItemDescription = classed.div`text-secondary selected:text-accent-secondary line-clamp-2 break-words`
