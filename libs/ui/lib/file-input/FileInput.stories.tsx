/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { FileInput } from './FileInput'

const props = { onChange: (file: File | null) => console.log('onChange', file) }

export const Default = () => <FileInput {...props} />

export const WithAccept = () => <FileInput accept=".doc,.docx,.tar.gz" {...props} />
