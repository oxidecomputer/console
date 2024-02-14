"use strict";
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
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
exports.resetDb = exports.db = exports.utilizationForSilo = exports.lookup = exports.lookupById = exports.notFoundErr = void 0;
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
// note that isUuid checks for any kind of UUID. strictly speaking, we should
// only be checking for v4
var uuid_1 = require("uuid");
var mock = require("@oxide/api-mocks");
var api_mocks_1 = require("@oxide/api-mocks");
var util_1 = require("@oxide/util");
var util_2 = require("./util");
var notFoundBody = { error_code: 'ObjectNotFound' };
var notFoundErr = function (msg) {
    var message = msg ? "not found: ".concat(msg) : 'not found';
    return (0, util_2.json)({ error_code: 'ObjectNotFound', message: message }, { status: 404 });
};
exports.notFoundErr = notFoundErr;
var lookupById = function (table, id) {
    var item = table.find(function (i) { return i.id === id; });
    if (!item)
        throw exports.notFoundErr;
    return item;
};
exports.lookupById = lookupById;
exports.lookup = {
    project: function (_a) {
        var id = _a.project;
        if (!id)
            throw exports.notFoundErr;
        if ((0, uuid_1.validate)(id))
            return (0, exports.lookupById)(exports.db.projects, id);
        var project = exports.db.projects.find(function (p) { return p.name === id; });
        if (!project)
            throw exports.notFoundErr;
        return project;
    },
    instance: function (_a) {
        var id = _a.instance, projectSelector = __rest(_a, ["instance"]);
        if (!id)
            throw exports.notFoundErr;
        if ((0, uuid_1.validate)(id))
            return (0, exports.lookupById)(exports.db.instances, id);
        var project = exports.lookup.project(projectSelector);
        var instance = exports.db.instances.find(function (i) { return i.project_id === project.id && i.name === id; });
        if (!instance)
            throw exports.notFoundErr;
        return instance;
    },
    networkInterface: function (_a) {
        var id = _a.interface, instanceSelector = __rest(_a, ["interface"]);
        if (!id)
            throw exports.notFoundErr;
        if ((0, uuid_1.validate)(id))
            return (0, exports.lookupById)(exports.db.networkInterfaces, id);
        var instance = exports.lookup.instance(instanceSelector);
        var nic = exports.db.networkInterfaces.find(function (n) { return n.instance_id === instance.id && n.name === id; });
        if (!nic)
            throw exports.notFoundErr;
        return nic;
    },
    disk: function (_a) {
        var id = _a.disk, projectSelector = __rest(_a, ["disk"]);
        if (!id)
            throw exports.notFoundErr;
        if ((0, uuid_1.validate)(id))
            return (0, exports.lookupById)(exports.db.disks, id);
        var project = exports.lookup.project(projectSelector);
        var disk = exports.db.disks.find(function (d) { return d.project_id === project.id && d.name === id; });
        if (!disk)
            throw exports.notFoundErr;
        return disk;
    },
    floatingIp: function (_a) {
        var id = _a.floatingIp, projectSelector = __rest(_a, ["floatingIp"]);
        if (!id)
            throw exports.notFoundErr;
        if ((0, uuid_1.validate)(id))
            return (0, exports.lookupById)(exports.db.floatingIps, id);
        var project = exports.lookup.project(projectSelector);
        var floatingIp = exports.db.floatingIps.find(function (i) { return i.project_id === project.id && i.name === id; });
        if (!floatingIp)
            throw exports.notFoundErr;
        return floatingIp;
    },
    snapshot: function (_a) {
        var id = _a.snapshot, projectSelector = __rest(_a, ["snapshot"]);
        if (!id)
            throw exports.notFoundErr;
        if ((0, uuid_1.validate)(id))
            return (0, exports.lookupById)(exports.db.snapshots, id);
        var project = exports.lookup.project(projectSelector);
        var snapshot = exports.db.snapshots.find(function (i) { return i.project_id === project.id && i.name === id; });
        if (!snapshot)
            throw exports.notFoundErr;
        return snapshot;
    },
    vpc: function (_a) {
        var id = _a.vpc, projectSelector = __rest(_a, ["vpc"]);
        if (!id)
            throw exports.notFoundErr;
        if ((0, uuid_1.validate)(id))
            return (0, exports.lookupById)(exports.db.vpcs, id);
        var project = exports.lookup.project(projectSelector);
        var vpc = exports.db.vpcs.find(function (v) { return v.project_id === project.id && v.name === id; });
        if (!vpc)
            throw exports.notFoundErr;
        return vpc;
    },
    vpcSubnet: function (_a) {
        var id = _a.subnet, vpcSelector = __rest(_a, ["subnet"]);
        if (!id)
            throw exports.notFoundErr;
        if ((0, uuid_1.validate)(id))
            return (0, exports.lookupById)(exports.db.vpcSubnets, id);
        var vpc = exports.lookup.vpc(vpcSelector);
        var subnet = exports.db.vpcSubnets.find(function (s) { return s.vpc_id === vpc.id && s.name === id; });
        if (!subnet)
            throw exports.notFoundErr;
        return subnet;
    },
    image: function (_a) {
        var id = _a.image, projectId = _a.project;
        if (!id)
            throw exports.notFoundErr;
        if ((0, uuid_1.validate)(id))
            return (0, exports.lookupById)(exports.db.images, id);
        var image;
        if (projectId === undefined) {
            // silo image
            image = exports.db.images.find(function (d) { return d.project_id === undefined && d.name === id; });
        }
        else {
            // project image
            var project_1 = exports.lookup.project({ project: projectId });
            image = exports.db.images.find(function (d) { return d.project_id === project_1.id && d.name === id; });
        }
        if (!image)
            throw exports.notFoundErr;
        return image;
    },
    ipPool: function (_a) {
        var id = _a.pool;
        if (!id)
            throw exports.notFoundErr;
        if ((0, uuid_1.validate)(id))
            return (0, exports.lookupById)(exports.db.ipPools, id);
        var pool = exports.db.ipPools.find(function (p) { return p.name === id; });
        if (!pool)
            throw exports.notFoundErr;
        return pool;
    },
    // unusual one because it's a sibling relationship. we look up both the pool and the silo first
    ipPoolSiloLink: function (_a) {
        var poolId = _a.pool, siloId = _a.silo;
        var pool = exports.lookup.ipPool({ pool: poolId });
        var silo = exports.lookup.silo({ silo: siloId });
        var ipPoolSilo = exports.db.ipPoolSilos.find(function (ips) { return ips.ip_pool_id === pool.id && ips.silo_id === silo.id; });
        if (!ipPoolSilo)
            throw exports.notFoundErr;
        return ipPoolSilo;
    },
    // unusual because it returns a list, but we need it for multiple endpoints
    siloIpPools: function (path) {
        var silo = exports.lookup.silo(path);
        // effectively join db.ipPools and db.ipPoolSilos on ip_pool_id
        return exports.db.ipPoolSilos
            .filter(function (link) { return link.silo_id === silo.id; })
            .map(function (link) {
            var pool = exports.db.ipPools.find(function (pool) { return pool.id === link.ip_pool_id; });
            // this should never happen
            if (!pool) {
                var linkStr = JSON.stringify(link);
                var message = "Found IP pool-silo link without corresponding pool: ".concat(linkStr);
                throw (0, util_2.json)({ message: message }, { status: 500 });
            }
            return __assign(__assign({}, pool), { is_default: link.is_default });
        });
    },
    samlIdp: function (_a) {
        var id = _a.provider, siloSelector = __rest(_a, ["provider"]);
        if (!id)
            throw exports.notFoundErr;
        var silo = exports.lookup.silo(siloSelector);
        var dbIdp = exports.db.identityProviders.find(function (_a) {
            var type = _a.type, siloId = _a.siloId, provider = _a.provider;
            return type === 'saml' && siloId === silo.id && provider.name === id;
        });
        if (!dbIdp)
            throw exports.notFoundErr;
        return dbIdp.provider;
    },
    silo: function (_a) {
        var id = _a.silo;
        if (!id)
            throw exports.notFoundErr;
        if ((0, uuid_1.validate)(id))
            return (0, exports.lookupById)(exports.db.silos, id);
        var silo = exports.db.silos.find(function (o) { return o.name === id; });
        if (!silo)
            throw exports.notFoundErr;
        return silo;
    },
    sled: function (_a) {
        var id = _a.sledId;
        if (!id)
            throw exports.notFoundErr;
        return (0, exports.lookupById)(exports.db.sleds, id);
    },
    sshKey: function (_a) {
        var id = _a.sshKey;
        // we don't have a concept of mock session. assume the user is user1
        var userSshKeys = exports.db.sshKeys.filter(function (key) { return key.silo_user_id === api_mocks_1.user1.id; });
        if ((0, uuid_1.validate)(id))
            return (0, exports.lookupById)(userSshKeys, id);
        var sshKey = userSshKeys.find(function (key) { return key.name === id; });
        if (!sshKey)
            throw exports.notFoundErr;
        return sshKey;
    },
};
function utilizationForSilo(silo) {
    var quotas = exports.db.siloQuotas.find(function (q) { return q.silo_id === silo.id; });
    if (!quotas)
        throw (0, util_2.internalError)();
    var provisioned = exports.db.siloProvisioned.find(function (p) { return p.silo_id === silo.id; });
    if (!provisioned)
        throw (0, util_2.internalError)();
    return {
        allocated: (0, util_1.pick)(quotas, 'cpus', 'storage', 'memory'),
        provisioned: (0, util_1.pick)(provisioned, 'cpus', 'storage', 'memory'),
        silo_id: silo.id,
        silo_name: silo.name,
    };
}
exports.utilizationForSilo = utilizationForSilo;
var initDb = {
    disks: __spreadArray([], mock.disks, true),
    diskBulkImportState: new Map(),
    floatingIps: __spreadArray([], mock.floatingIps, true),
    userGroups: __spreadArray([], mock.userGroups, true),
    /** Join table for `users` and `userGroups` */
    groupMemberships: __spreadArray([], mock.groupMemberships, true),
    images: __spreadArray([], mock.images, true),
    externalIps: __spreadArray([], mock.externalIps, true),
    instances: __spreadArray([], mock.instances, true),
    ipPools: __spreadArray([], mock.ipPools, true),
    ipPoolSilos: __spreadArray([], mock.ipPoolSilos, true),
    ipPoolRanges: __spreadArray([], mock.ipPoolRanges, true),
    networkInterfaces: [mock.networkInterface],
    physicalDisks: __spreadArray([], mock.physicalDisks, true),
    projects: __spreadArray([], mock.projects, true),
    racks: __spreadArray([], mock.racks, true),
    roleAssignments: __spreadArray([], mock.roleAssignments, true),
    silos: __spreadArray([], mock.silos, true),
    siloQuotas: __spreadArray([], mock.siloQuotas, true),
    siloProvisioned: __spreadArray([], mock.siloProvisioned, true),
    identityProviders: __spreadArray([], mock.identityProviders, true),
    sleds: __spreadArray([], mock.sleds, true),
    snapshots: __spreadArray([], mock.snapshots, true),
    sshKeys: __spreadArray([], mock.sshKeys, true),
    users: __spreadArray([], mock.users, true),
    vpcFirewallRules: __spreadArray([], mock.defaultFirewallRules, true),
    vpcs: [mock.vpc],
    vpcSubnets: [mock.vpcSubnet],
};
exports.db = structuredClone(initDb);
function resetDb() {
    exports.db = structuredClone(initDb);
}
exports.resetDb = resetDb;
