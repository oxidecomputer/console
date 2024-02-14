"use strict";
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ipPoolRanges = exports.ipPoolSilos = exports.ipPools = void 0;
var silo_1 = require("./silo");
var ipPool1 = {
    id: '69b5c583-74a9-451a-823d-0741c1ec66e2',
    name: 'ip-pool-1',
    description: '',
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
};
var ipPool2 = {
    id: 'af2fbe06-b21d-4364-96b7-a58220bc3242',
    name: 'ip-pool-2',
    description: '',
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
};
var ipPool3 = {
    id: '8929a9ec-03d7-4027-8bf3-dda76627de07',
    name: 'ip-pool-3',
    description: '',
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
};
exports.ipPools = [ipPool1, ipPool2, ipPool3];
exports.ipPoolSilos = [
    {
        ip_pool_id: ipPool1.id,
        silo_id: silo_1.defaultSilo.id,
        is_default: true,
    },
    {
        ip_pool_id: ipPool2.id,
        silo_id: silo_1.defaultSilo.id,
        is_default: false,
    },
];
exports.ipPoolRanges = [
    {
        id: 'bbfcf3f2-061e-4334-a0e7-dfcd8171f87e',
        ip_pool_id: ipPool1.id,
        range: {
            first: '10.0.0.1',
            last: '10.0.0.5',
        },
        time_created: new Date().toISOString(),
    },
    {
        id: 'df05795b-cb88-4971-9865-ac2995c2b2d4',
        ip_pool_id: ipPool1.id,
        range: {
            first: '10.0.0.20',
            last: '10.0.0.22',
        },
        time_created: new Date().toISOString(),
    },
    {
        id: '7e6e94b9-748e-4219-83a3-cec76253ec70',
        ip_pool_id: ipPool2.id,
        range: {
            first: '10.0.0.33',
            last: '10.0.0.38',
        },
        time_created: new Date().toISOString(),
    },
];
