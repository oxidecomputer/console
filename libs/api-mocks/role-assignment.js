"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleAssignments = void 0;
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
var api_1 = require("@oxide/api");
var project_1 = require("./project");
var silo_1 = require("./silo");
var user_1 = require("./user");
var user_group_1 = require("./user-group");
exports.roleAssignments = [
    {
        resource_type: 'fleet',
        resource_id: api_1.FLEET_ID,
        identity_id: user_1.user1.id,
        identity_type: 'silo_user',
        role_name: 'admin',
    },
    {
        resource_type: 'silo',
        resource_id: silo_1.defaultSilo.id,
        identity_id: user_group_1.userGroup3.id,
        identity_type: 'silo_group',
        role_name: 'collaborator',
    },
    {
        resource_type: 'silo',
        resource_id: silo_1.defaultSilo.id,
        identity_id: user_1.user1.id,
        identity_type: 'silo_user',
        role_name: 'admin',
    },
    {
        resource_type: 'project',
        resource_id: project_1.project.id,
        identity_id: user_1.user3.id,
        identity_type: 'silo_user',
        role_name: 'collaborator',
    },
    {
        resource_type: 'project',
        resource_id: project_1.project.id,
        identity_id: user_group_1.userGroup2.id,
        identity_type: 'silo_group',
        role_name: 'viewer',
    },
];
