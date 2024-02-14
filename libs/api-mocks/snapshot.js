"use strict";
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.snapshots = void 0;
var uuid_1 = require("uuid");
var disk_1 = require("./disk");
var project_1 = require("./project");
var generatedSnapshots = Array.from({ length: 25 }, function (_, i) {
    return generateSnapshot(i);
});
exports.snapshots = __spreadArray([
    {
        id: 'ab805e59-b6b8-4c73-8081-6a224b6b0698',
        name: 'snapshot-1',
        description: "it's a snapshot",
        project_id: project_1.project.id,
        time_created: new Date().toISOString(),
        time_modified: new Date().toISOString(),
        size: 1024,
        disk_id: disk_1.disks[0].id,
        state: 'ready',
    },
    {
        id: '9a29813d-e94b-4c6a-82a0-672af3f78a6f',
        name: 'snapshot-2',
        description: "it's a second snapshot",
        project_id: project_1.project.id,
        time_created: new Date().toISOString(),
        time_modified: new Date().toISOString(),
        size: 2048,
        disk_id: disk_1.disks[0].id,
        state: 'ready',
    },
    {
        id: 'e6c58826-62fb-4205-820e-620407cd04e7',
        name: 'delete-500',
        description: "it's a third snapshot",
        project_id: project_1.project.id,
        time_created: new Date().toISOString(),
        time_modified: new Date().toISOString(),
        size: 3072,
        disk_id: disk_1.disks[0].id,
        state: 'ready',
    },
    {
        id: 'dc598369-4554-4ccd-aa89-a837e6ca487d',
        name: 'snapshot-4',
        description: "it's a fourth snapshot",
        project_id: project_1.project.id,
        time_created: new Date().toISOString(),
        time_modified: new Date().toISOString(),
        size: 4096,
        disk_id: disk_1.disks[0].id,
        state: 'ready',
    },
    {
        id: 'ca117fc6-d3e4-452e-9e1c-15abea752ff6',
        name: 'snapshot-disk-deleted',
        description: 'technically it never existed',
        project_id: project_1.project.id,
        time_created: new Date().toISOString(),
        time_modified: new Date().toISOString(),
        size: 5120,
        disk_id: 'a6f61e3f-25c1-49b0-a013-ac6a2d98a948',
        state: 'ready',
    }
], generatedSnapshots, true);
function generateSnapshot(index) {
    return {
        id: (0, uuid_1.v4)(),
        name: "disk-1-snapshot-".concat(index + 5),
        description: '',
        project_id: project_1.project.id,
        time_created: new Date().toISOString(),
        time_modified: new Date().toISOString(),
        size: 1024 * (index + 1),
        disk_id: disk_1.disks[0].id,
        state: 'ready',
    };
}
