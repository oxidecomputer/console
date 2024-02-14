"use strict";
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.floatingIps = exports.floatingIp2 = exports.floatingIp = void 0;
var _1 = require(".");
// A floating IP from the default pool
exports.floatingIp = {
    id: '3ca0ccb7-d66d-4fde-a871-ab9855eaea8e',
    name: 'rootbeer-float',
    description: 'A classic.',
    instance_id: undefined,
    ip: '192.168.32.1',
    project_id: _1.project.id,
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
};
// A floating IP attached to a particular instance
exports.floatingIp2 = {
    id: '0a00a6c3-4821-4bb8-af77-574468ac6651',
    name: 'cola-float',
    description: 'A favourite.',
    instance_id: _1.instance.id,
    ip: '192.168.64.64',
    project_id: _1.project.id,
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
};
exports.floatingIps = [exports.floatingIp, exports.floatingIp2];
