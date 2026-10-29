/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { subHours } from 'date-fns'

import type { Problem, ProblemImpact, Alert } from '@oxide/api'

import type { Json } from './json-type'

// The only problem code Nexus defines is a placeholder for testing, so these
// use its title and docs text. Nexus doesn't record impacts, relations,
// support bundles, or alerts for problems yet (those endpoints return empty
// lists), so those tables start empty. Revisions start at 1, matching the
// generation number Nexus stores them as.
// https://github.com/oxidecomputer/omicron/blob/2a4a125/nexus/types/src/fm/problem.rs#L33-L77
// https://github.com/oxidecomputer/omicron/blob/2a4a125/nexus/src/app/problem.rs#L61-L121

const hoursAgo = (n: number) => subHours(new Date(), n).toISOString()

const notARealProblem = {
  code: 0,
  class: 'system',
  summary: 'Not a Real Problem',
  description: 'This is not a real problem. It exists only for testing purposes.',
  action_required:
    'If you encounter this problem in real life, this is a bug. Please contact Oxide support.',
}

export const testProblem: Json<Problem> = {
  ...notARealProblem,
  id: '316089b7-593c-4995-bea7-a19c8526b13d',
  state: 'active',
  revision: 1,
  time_created: hoursAgo(5),
  time_modified: hoursAgo(5),
}

export const resolvedTestProblem: Json<Problem> = {
  ...notARealProblem,
  id: 'c9964ac4-747e-4357-a037-95415c65b42a',
  state: 'resolved',
  revision: 2,
  time_created: hoursAgo(24 * 3),
  time_modified: hoursAgo(24 * 2),
  time_resolved: hoursAgo(24 * 2),
}

export const problems: Json<Problem>[] = [testProblem, resolvedTestProblem]

export const problemImpacts: Json<ProblemImpact>[] = []

/**
 * Edge in the causality graph. `revision_added` is the revision of each side
 * in which the edge appeared, since the API reports it relative to the problem
 * being viewed.
 */
export type DbProblemRelation = {
  cause_id: string
  consequence_id: string
  reason: string
  cause_revision_added: number
  consequence_revision_added: number
}

export const problemRelations: DbProblemRelation[] = []

export const problemSupportBundles: { problem_id: string; bundle_id: string }[] = []

/** Included in the main `alerts` fixture, like any other alert */
export const problemAlerts: Json<Alert>[] = []

export const problemAlertIds: { problem_id: string; alert_id: string }[] = []
