"use strict";
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultFirewallRules = exports.vpcSubnet2 = exports.vpcSubnet = exports.vpc = void 0;
var project_1 = require("./project");
var time_created = new Date(2021, 0, 1).toISOString();
var time_modified = new Date(2021, 0, 2).toISOString();
var systemRouterId = 'b5af837b-b986-4a0a-b775-516d76c84ec3';
exports.vpc = {
    id: '87774ff3-c6c1-475b-b920-ba2954f390fe',
    name: 'mock-vpc',
    description: 'a fake vpc',
    dns_name: 'mock-vpc',
    project_id: project_1.project.id,
    system_router_id: systemRouterId,
    ipv6_prefix: 'fdf6:1818:b6e1::/48',
    time_created: time_created,
    time_modified: time_modified,
};
exports.vpcSubnet = {
    // this is supposed to be flattened into the top level. will fix in API
    id: 'd12bf934-d2bf-40e9-8596-bb42a7793749',
    name: 'mock-subnet',
    description: 'a fake subnet',
    time_created: new Date(2021, 0, 1).toISOString(),
    time_modified: new Date(2021, 0, 2).toISOString(),
    // supposed to be camelcase, will fix in API
    vpc_id: exports.vpc.id,
    ipv4_block: '10.1.1.1/24',
    ipv6_block: 'fd9b:870a:4245::/64',
};
exports.vpcSubnet2 = __assign(__assign({}, exports.vpcSubnet), { id: 'cb001986-1dbe-440c-8872-a769a5c3cda6', name: 'mock-subnet-2', vpc_id: exports.vpc.id, ipv4_block: '10.1.1.2/24' });
exports.defaultFirewallRules = [
    {
        id: 'b74aeea8-1201-4efd-b6ec-011f10a0b176',
        name: 'allow-internal-inbound',
        status: 'enabled',
        direction: 'inbound',
        targets: [{ type: 'vpc', value: 'default' }],
        action: 'allow',
        description: 'allow inbound traffic to all instances within the VPC if originated within the VPC',
        filters: {
            hosts: [{ type: 'vpc', value: 'default' }],
        },
        priority: 65534,
        time_created: time_created,
        time_modified: time_modified,
        vpc_id: exports.vpc.id,
    },
    {
        id: '9802cd8e-1e59-4fdf-9b40-99c189f7a19b',
        name: 'allow-ssh',
        status: 'enabled',
        direction: 'inbound',
        targets: [{ type: 'vpc', value: 'default' }],
        description: 'allow inbound TCP connections on port 22 from anywhere',
        filters: {
            ports: ['22'],
            protocols: ['TCP'],
        },
        action: 'allow',
        priority: 65534,
        time_created: time_created,
        time_modified: time_modified,
        vpc_id: exports.vpc.id,
    },
    {
        id: 'cde07d86-b8c0-49ed-8754-55f1bdee20fe',
        name: 'allow-icmp',
        status: 'enabled',
        direction: 'inbound',
        targets: [{ type: 'vpc', value: 'default' }],
        description: 'allow inbound ICMP traffic from anywhere',
        filters: {
            protocols: ['ICMP'],
        },
        action: 'allow',
        priority: 65534,
        time_created: time_created,
        time_modified: time_modified,
        vpc_id: exports.vpc.id,
    },
    {
        id: '5ed562d9-2566-496d-b7b3-7976b04a0b80',
        name: 'allow-rdp',
        status: 'enabled',
        direction: 'inbound',
        targets: [{ type: 'vpc', value: 'default' }],
        description: 'allow inbound TCP connections on port 3389 from anywhere',
        filters: {
            ports: ['3389'],
            protocols: ['TCP'],
        },
        action: 'allow',
        priority: 65534,
        time_created: time_created,
        time_modified: time_modified,
        vpc_id: exports.vpc.id,
    },
];
