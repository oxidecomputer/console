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
exports.requireRole = exports.requireFleetViewer = exports.userHasRole = exports.currentUser = exports.MSW_USER_COOKIE = exports.handleMetrics = exports.generateUtilization = exports.errIfInvalidDiskSize = exports.errIfExists = exports.internalError = exports.NotImplemented = exports.unavailableErr = exports.getTimestamps = exports.getStartAndEndTime = exports.repeat = exports.paginated = exports.json = void 0;
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
var date_fns_1 = require("date-fns");
var api_1 = require("@oxide/api");
var msw_handlers_1 = require("@oxide/gen/msw-handlers");
var util_1 = require("@oxide/util");
var metrics_1 = require("../metrics");
var db_1 = require("./db");
var msw_handlers_2 = require("@oxide/gen/msw-handlers");
Object.defineProperty(exports, "json", { enumerable: true, get: function () { return msw_handlers_2.json; } });
var paginated = function (params, items) {
    var _a = params || {}, _b = _a.limit, limit = _b === void 0 ? 100 : _b, pageToken = _a.pageToken;
    var startIndex = pageToken ? items.findIndex(function (i) { return i.id === pageToken; }) : 0;
    startIndex = startIndex < 0 ? 0 : startIndex;
    if (startIndex > items.length) {
        return {
            items: [],
            nextPage: null,
        };
    }
    if (limit + startIndex >= items.length) {
        return {
            items: items.slice(startIndex),
            nextPage: null,
        };
    }
    return {
        items: items.slice(startIndex, startIndex + limit),
        nextPage: "".concat(items[startIndex + limit].id),
    };
};
exports.paginated = paginated;
// make a bunch of copies of an object with different names and IDs. useful for
// testing pagination
var repeat = function (obj, n) {
    return new Array(n).fill(0).map(function (_, i) { return (__assign(__assign({}, obj), { id: obj.id + i, name: obj.name + i })); });
};
exports.repeat = repeat;
function getStartAndEndTime(params) {
    // if no start time or end time, give the last 24 hours. in this case the
    // API will give all data available for the metric (paginated of course),
    // so essentially we're pretending the last 24 hours just happens to be
    // all the data. if we have an end time but no start time, same deal, pretend
    // 24 hours before the given end time is where it starts
    var now = new Date();
    var _a = params.endTime, endTime = _a === void 0 ? now : _a, _b = params.startTime, startTime = _b === void 0 ? (0, date_fns_1.subHours)(endTime, 24) : _b;
    return { startTime: startTime, endTime: endTime };
}
exports.getStartAndEndTime = getStartAndEndTime;
function getTimestamps() {
    var now = new Date().toISOString();
    return { time_created: now, time_modified: now };
}
exports.getTimestamps = getTimestamps;
var unavailableErr = function () {
    return (0, msw_handlers_1.json)({ error_code: 'ServiceUnavailable' }, { status: 503 });
};
exports.unavailableErr = unavailableErr;
var NotImplemented = function () {
    // This doesn't just return the response because it broadens the type to be usable
    // directly as a handler
    throw (0, msw_handlers_1.json)({ error_code: 'NotImplemented' }, { status: 501 });
};
exports.NotImplemented = NotImplemented;
var internalError = function () { return (0, msw_handlers_1.json)({ error_code: 'InternalError' }, { status: 500 }); };
exports.internalError = internalError;
var errIfExists = function (collection, match, resourceLabel) {
    if (resourceLabel === void 0) { resourceLabel = 'resource'; }
    if (collection.some(function (item) {
        return Object.entries(match).every(function (_a) {
            var key = _a[0], value = _a[1];
            return item[key] === value;
        });
    })) {
        var name_1 = 'name' in match ? match.name : 'id' in match ? match.id : '<resource>';
        throw (0, msw_handlers_1.json)({
            error_code: 'ObjectAlreadyExists',
            message: "already exists: ".concat(resourceLabel, " \"").concat(name_1, "\""),
        }, { status: 400 });
    }
};
exports.errIfExists = errIfExists;
var errIfInvalidDiskSize = function (disk) {
    var _a, _b, _c, _d;
    var source = disk.disk_source;
    if (disk.size < api_1.MIN_DISK_SIZE_GiB * util_1.GiB) {
        throw "Disk size must be greater than or equal to ".concat(api_1.MIN_DISK_SIZE_GiB, " GiB");
    }
    if (disk.size > api_1.MAX_DISK_SIZE_GiB * util_1.GiB) {
        throw "Disk size must be less than or equal to ".concat(api_1.MAX_DISK_SIZE_GiB, " GiB");
    }
    if (source.type === 'snapshot') {
        var snapshotSize = (_b = (_a = db_1.db.snapshots.find(function (s) { return source.snapshot_id === s.id; })) === null || _a === void 0 ? void 0 : _a.size) !== null && _b !== void 0 ? _b : 0;
        if (disk.size >= snapshotSize)
            return;
        throw 'Disk size must be greater than or equal to the snapshot size';
    }
    if (source.type === 'image') {
        var imageSize = (_d = (_c = db_1.db.images.find(function (i) { return source.image_id === i.id; })) === null || _c === void 0 ? void 0 : _c.size) !== null && _d !== void 0 ? _d : 0;
        if (disk.size >= imageSize)
            return;
        throw 'Disk size must be greater than or equal to the image size';
    }
};
exports.errIfInvalidDiskSize = errIfInvalidDiskSize;
var Rando = /** @class */ (function () {
    function Rando(seed, a, c, m) {
        if (a === void 0) { a = 1664525; }
        if (c === void 0) { c = 1013904223; }
        if (m === void 0) { m = Math.pow(2, 32); }
        this.seed = seed;
        this.a = a;
        this.c = c;
        this.m = m;
    }
    Rando.prototype.next = function () {
        this.seed = (this.a * this.seed + this.c) % this.m;
        return this.seed / this.m;
    };
    return Rando;
}());
function generateUtilization(metricName, startTime, endTime, sleds) {
    // generate data from at most 90 days ago no matter how early start time is
    var adjStartTime = new Date(Math.max(startTime.getTime(), Date.now() - 1000 * 60 * 60 * 24 * 90));
    var capacity = (0, api_1.totalCapacity)(sleds.map(function (s) { return ({
        usableHardwareThreads: s.usable_hardware_threads,
        usablePhysicalRam: s.usable_physical_ram,
    }); }));
    var cap = metricName === 'cpus_provisioned'
        ? capacity.cpu
        : metricName === 'virtual_disk_space_provisioned'
            ? capacity.disk_tib * util_1.TiB
            : capacity.ram_gib * util_1.GiB;
    var metricNameSeed = Array.from(metricName).reduce(function (acc, char) { return acc + char.charCodeAt(0); }, 0);
    var rando = new Rando(adjStartTime.getTime() + metricNameSeed);
    var diff = Math.abs((0, date_fns_1.differenceInSeconds)(adjStartTime, endTime));
    // How many quarter hour chunks in the date range
    // Use that as how often to offset the data to seem
    // more realistic
    var timeInterval = diff / 900;
    // If the data is the following length
    var dataCount = 1000;
    // How far along the array should we do something
    var valueInterval = Math.floor(dataCount / timeInterval);
    // Pick a reasonable start value
    var startVal = 500;
    var values = new Array(dataCount);
    values[0] = startVal;
    var x = 0;
    for (var i = 1; i < values.length; i++) {
        values[i] = values[i - 1];
        if (x === valueInterval) {
            // Do something 3/4 of the time
            var offset = 0;
            var random = rando.next();
            var threshold = i < 250 || (i > 500 && i < 750) ? 1 : 0.375;
            if (random < threshold) {
                var amount = 50;
                offset = Math.floor(random * amount);
                if (random < threshold / 2.5) {
                    offset = offset * -1;
                }
            }
            if (random > 0.72) {
                values[i] += offset;
            }
            else {
                values[i] = Math.max(values[i] - offset, 0);
            }
            x = 0;
        }
        else {
            x++;
        }
    }
    // Find the current maximum value in the generated data
    var currentMax = Math.max.apply(Math, values);
    // Normalize the data to sit within the range of 0 to overall capacity
    var randomFactor = Math.random() * (1 - 0.33) + 0.33;
    var normalizedValues = values.map(function (value) {
        var v = (value / currentMax) * cap * randomFactor;
        if (metricName === 'cpus_provisioned') {
            // CPU utilization should be whole numbers
            v = Math.floor(v);
        }
        return v;
    });
    return normalizedValues;
}
exports.generateUtilization = generateUtilization;
function handleMetrics(_a) {
    var metricName = _a.path.metricName, query = _a.query;
    var _b = getStartAndEndTime(query), startTime = _b.startTime, endTime = _b.endTime;
    if (endTime <= startTime)
        return { items: [] };
    var dataPoints = generateUtilization(metricName, startTime, endTime, db_1.db.sleds);
    // Important to remember (but probably not important enough to change) that
    // this works quite differently from the real API, which is going to be
    // querying clickhouse with some fixed set of data, and when it starts from
    // the end (order == 'descending') it's going to get data points starting
    // from the end. When it starts from the beginning it gets data points from
    // the beginning. For our fake data, we just generate the same set of data
    // points spanning the whole time range, then reverse the list if necessary
    // and take the first N=limit data points.
    var items = (0, metrics_1.genI64Data)(dataPoints, startTime, endTime);
    if (query.order === 'descending') {
        items.reverse();
    }
    if (typeof query.limit === 'number') {
        items = items.slice(0, query.limit);
    }
    return { items: items };
}
exports.handleMetrics = handleMetrics;
exports.MSW_USER_COOKIE = 'msw-user';
/**
 * Look up user by display name in cookie. Return the first user if cookie empty
 * or name not found. We're using display name to make it easier to set the
 * cookie by hand, because there is no way yet to pick a user through the UI.
 *
 * If cookie is empty or name is not found, return the first user in the list,
 * who has admin on everything.
 */
function currentUser(cookies) {
    var _a;
    var name = cookies[exports.MSW_USER_COOKIE];
    return (_a = db_1.db.users.find(function (u) { return u.display_name === name; })) !== null && _a !== void 0 ? _a : db_1.db.users[0];
}
exports.currentUser = currentUser;
/**
 * Given a role A, get a list of the roles (including A) that confer *at least*
 * the powers of A.
 */
// could implement with `takeUntil(allRoles, r => r === role)`, but that is so
// much harder to understand
var roleOrStronger = {
    viewer: ['viewer', 'collaborator', 'admin'],
    collaborator: ['collaborator', 'admin'],
    admin: ['admin'],
};
/**
 * Determine whether a user has a role at least as strong as `role` on the
 * specified resource. Note that this does not yet do parent-child inheritance
 * like Nexus does, i.e., if a user has collaborator on a silo, then it inherits
 * collaborator on all projects in the silo even if it has no explicit role on
 * those projects. This does NOT do that.
 */
function userHasRole(user, resourceType, resourceId, role) {
    var userGroupIds = db_1.db.groupMemberships
        .filter(function (gm) { return gm.userId === user.id; })
        .map(function (gm) { return db_1.db.userGroups.find(function (g) { return g.id === gm.groupId; }); })
        .filter(util_1.isTruthy)
        .map(function (g) { return g.id; });
    /** All actors with *at least* the specified role on the resource */
    var actorsWithRole = db_1.db.roleAssignments
        .filter(function (ra) {
        return ra.resource_type === resourceType &&
            ra.resource_id === resourceId &&
            roleOrStronger[role].includes(ra.role_name);
    })
        .map(function (ra) { return ra.identity_id; });
    // user has role if their own ID or any of their groups is associated with the role
    return __spreadArray([user.id], userGroupIds, true).some(function (id) { return actorsWithRole.includes(id); });
}
exports.userHasRole = userHasRole;
/**
 * Determine whether current user has fleet viewer permissions by looking for
 * fleet roles for the user as well as for the user's groups. Do nothing if yes,
 * throw 403 if no.
 */
function requireFleetViewer(cookies) {
    requireRole(cookies, 'fleet', api_1.FLEET_ID, 'viewer');
}
exports.requireFleetViewer = requireFleetViewer;
/**
 * Determine whether current user has a role on a resource by looking roles
 * for the user as well as for the user's groups. Do nothing if yes, throw 403
 * if no.
 */
function requireRole(cookies, resourceType, resourceId, role) {
    var user = currentUser(cookies);
    // should it 404? I think the API is a mix
    if (!userHasRole(user, resourceType, resourceId, role))
        throw 403;
}
exports.requireRole = requireRole;
