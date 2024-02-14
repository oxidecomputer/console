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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
exports.handlers = void 0;
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
var msw_1 = require("msw");
var uuid_1 = require("uuid");
var api_1 = require("@oxide/api");
var msw_handlers_1 = require("@oxide/gen/msw-handlers");
var util_1 = require("@oxide/util");
var metrics_1 = require("../metrics");
var serial_1 = require("../serial");
var silo_1 = require("../silo");
var db_1 = require("./db");
var util_2 = require("./util");
// Note the *JSON types. Those represent actual API request and response bodies,
// the snake-cased objects coming straight from the API before the generated
// client camel-cases the keys and parses date fields. Inside the mock API everything
// is *JSON type.
exports.handlers = (0, msw_handlers_1.makeHandlers)({
    ping: function () { return ({ status: 'ok' }); },
    deviceAuthRequest: function () { return 200; },
    deviceAuthConfirm: function (_a) {
        var body = _a.body;
        return (body.user_code === 'ERRO-RABC' ? 400 : 200);
    },
    deviceAccessToken: function () { return 200; },
    loginLocal: function (_a) {
        var password = _a.body.password;
        return (password === 'bad' ? 401 : 200);
    },
    groupList: function (params) { return (0, util_2.paginated)(params.query, db_1.db.userGroups); },
    groupView: function (params) { return (0, db_1.lookupById)(db_1.db.userGroups, params.path.groupId); },
    projectList: function (params) { return (0, util_2.paginated)(params.query, db_1.db.projects); },
    projectCreate: function (_a) {
        var body = _a.body;
        (0, util_2.errIfExists)(db_1.db.projects, { name: body.name }, 'project');
        var newProject = __assign(__assign({ id: (0, uuid_1.v4)() }, body), (0, util_2.getTimestamps)());
        db_1.db.projects.push(newProject);
        return (0, msw_handlers_1.json)(newProject, { status: 201 });
    },
    projectView: function (_a) {
        var path = _a.path;
        if (path.project.endsWith('error-503')) {
            throw util_2.unavailableErr;
        }
        return db_1.lookup.project(__assign({}, path));
    },
    projectUpdate: function (_a) {
        var body = _a.body, path = _a.path;
        var project = db_1.lookup.project(__assign({}, path));
        if (body.name) {
            // only check for existing name if it's being changed
            if (body.name !== project.name) {
                (0, util_2.errIfExists)(db_1.db.projects, { name: body.name });
            }
            project.name = body.name;
        }
        project.description = body.description || '';
        return project;
    },
    projectDelete: function (_a) {
        var path = _a.path;
        var project = db_1.lookup.project(__assign({}, path));
        // imitate API logic (TODO: check for every other kind of project child)
        if (db_1.db.vpcs.some(function (vpc) { return vpc.project_id === project.id; })) {
            throw 'Project to be deleted contains a VPC';
        }
        db_1.db.projects = db_1.db.projects.filter(function (p) { return p.id !== project.id; });
        return 204;
    },
    diskList: function (_a) {
        var query = _a.query;
        var project = db_1.lookup.project(query);
        var disks = db_1.db.disks.filter(function (d) { return d.project_id === project.id; });
        return (0, util_2.paginated)(query, disks);
    },
    diskCreate: function (_a) {
        var body = _a.body, query = _a.query;
        var project = db_1.lookup.project(query);
        (0, util_2.errIfExists)(db_1.db.disks, { name: body.name, project_id: project.id });
        if (body.name === 'disk-create-500')
            throw 500;
        var name = body.name, description = body.description, size = body.size, disk_source = body.disk_source;
        var newDisk = __assign({ id: (0, uuid_1.v4)(), project_id: project.id, state: disk_source.type === 'importing_blocks'
                ? { state: 'import_ready' }
                : { state: 'creating' }, device_path: '/mnt/disk', name: name, description: description, size: size, 
            // TODO: for non-blank disk sources, look up image or snapshot by ID and
            // pull block size from there
            block_size: disk_source.type === 'blank' ? disk_source.block_size : 512 }, (0, util_2.getTimestamps)());
        db_1.db.disks.push(newDisk);
        return (0, msw_handlers_1.json)(newDisk, { status: 201 });
    },
    diskView: function (_a) {
        var path = _a.path, query = _a.query;
        return db_1.lookup.disk(__assign(__assign({}, path), query));
    },
    diskDelete: function (_a) {
        var path = _a.path, query = _a.query;
        var disk = db_1.lookup.disk(__assign(__assign({}, path), query));
        if (!api_1.diskCan.delete(disk)) {
            throw 'Cannot delete disk in state ' + disk.state.state;
        }
        db_1.db.disks = db_1.db.disks.filter(function (d) { return d.id !== disk.id; });
        return 204;
    },
    diskMetricsList: function (_a) {
        var path = _a.path, query = _a.query;
        db_1.lookup.disk(__assign(__assign({}, path), query));
        var _b = (0, util_2.getStartAndEndTime)(query), startTime = _b.startTime, endTime = _b.endTime;
        if (endTime <= startTime)
            return { items: [] };
        return {
            items: (0, metrics_1.genCumulativeI64Data)(new Array(1000).fill(0).map(function (_x, i) { return Math.floor(Math.tanh(i / 500) * 3000); }), startTime, endTime),
        };
    },
    diskBulkWriteImportStart: function (_a) {
        var path = _a.path, query = _a.query;
        var disk = db_1.lookup.disk(__assign(__assign({}, path), query));
        if (disk.name === 'import-start-500')
            throw 500;
        if (disk.state.state !== 'import_ready') {
            throw 'Can only enter state importing_from_bulk_write from import_ready';
        }
        // throw 400
        db_1.db.diskBulkImportState.set(disk.id, { blocks: {} });
        disk.state = { state: 'importing_from_bulk_writes' };
        return 204;
    },
    diskBulkWriteImportStop: function (_a) {
        var path = _a.path, query = _a.query;
        var disk = db_1.lookup.disk(__assign(__assign({}, path), query));
        if (disk.name === 'import-stop-500')
            throw 500;
        if (disk.state.state !== 'importing_from_bulk_writes') {
            throw 'Can only stop import for disk in state importing_from_bulk_write';
        }
        db_1.db.diskBulkImportState.delete(disk.id);
        disk.state = { state: 'import_ready' };
        return 204;
    },
    diskBulkWriteImport: function (_a) {
        var path = _a.path, query = _a.query, body = _a.body;
        var disk = db_1.lookup.disk(__assign(__assign({}, path), query));
        var diskImport = db_1.db.diskBulkImportState.get(disk.id);
        if (!diskImport)
            throw db_1.notFoundErr;
        // if (Math.random() < 0.01) throw 400
        diskImport.blocks[body.offset] = true;
        return 204;
    },
    diskFinalizeImport: function (_a) {
        var path = _a.path, query = _a.query, body = _a.body;
        var disk = db_1.lookup.disk(__assign(__assign({}, path), query));
        if (disk.name === 'disk-finalize-500')
            throw 500;
        if (disk.state.state !== 'import_ready') {
            throw "Cannot finalize disk in state ".concat(disk.state.state, ". Must be import_ready.");
        }
        // for now, don't check that the file is complete. the API doesn't
        disk.state = { state: 'detached' };
        if (body.snapshot_name) {
            var newSnapshot = __assign(__assign({ id: (0, uuid_1.v4)(), name: body.snapshot_name, description: 'temporary snapshot for making an image' }, (0, util_2.getTimestamps)()), { state: 'ready', project_id: disk.project_id, disk_id: disk.id, size: disk.size });
            db_1.db.snapshots.push(newSnapshot);
        }
        return 204;
    },
    // floatingIpCreate({ body, query }) {
    //   const project = lookup.project(query)
    //   errIfExists(db.floatingIps, { name: body.name })
    //   const newFloatingIp: Json<Api.FloatingIp> = {
    //     id: uuid(),
    //     project_id: project.id,
    //     ip: `${[...Array(4)].map(()=>Math.floor(Math.random()*256)).join('.')}`,
    //     ...body,
    //     ...getTimestamps(),
    //   }
    //   db.floatingIps.push(newFloatingIp)
    //   return json(newFloatingIp, { status: 201 })
    // },
    // floatingIpList({ query }) {
    //   const project = lookup.project(query)
    //   const ips = db.floatingIps.filter((i) => i.project_id === project.id)
    //   return paginated(query, ips)
    // },
    // floatingIpView({ query, path }) {
    //   const project = lookup.project(query)
    //   const ip = db.floatingIps.filter(
    //     (i) => i.project_id === project.id && i.name === path.floatingIp
    //   )[0]
    //   return ip
    // },
    // floatingIpDelete({ path, query }) {
    //   const floatingIp = lookup.floatingIp({ ...path, ...query })
    //   db.floatingIps = db.floatingIps.filter((i) => i.id !== floatingIp.id)
    //   return 204
    // },
    // floatingIpAttach({ body, path, query }) {
    //   const floatingIp = lookup.floatingIp({ ...path, ...query })
    //   const instance = lookup.instance({ instance: body.parent })
    //   console.log(instance)
    //   floatingIp.instance_id = instance.id
    //   console.log(floatingIp)
    //   return floatingIp
    // },
    // floatingIpDetach({ path, query }) {
    //   const floatingIp: FloatingIp = lookup.floatingIp({ ...path, ...query })
    //   db.floatingIps = db.floatingIps.map((ip : FloatingIp) => (ip.id !== floatingIp.id) ? ip : { ...ip, instance_id: undefined })
    //   return 204
    // },
    imageList: function (_a) {
        var query = _a.query;
        if (query.project) {
            var project_1 = db_1.lookup.project(query);
            var images_1 = db_1.db.images.filter(function (i) { return i.project_id === project_1.id; });
            return (0, util_2.paginated)(query, images_1);
        }
        // silo images
        var images = db_1.db.images.filter(function (i) { return !i.project_id; });
        return (0, util_2.paginated)(query, images);
    },
    imageCreate: function (_a) {
        var body = _a.body, query = _a.query;
        var project_id = undefined;
        if (query.project) {
            project_id = db_1.lookup.project(query).id;
        }
        (0, util_2.errIfExists)(db_1.db.images, { name: body.name, project_id: project_id });
        var size = body.source.type === 'snapshot'
            ? db_1.lookup.snapshot({ snapshot: body.source.id }).size
            : 100;
        var newImage = __assign(__assign({ id: (0, uuid_1.v4)(), project_id: project_id, size: size, block_size: 512 }, body), (0, util_2.getTimestamps)());
        db_1.db.images.push(newImage);
        return (0, msw_handlers_1.json)(newImage, { status: 201 });
    },
    imageView: function (_a) {
        var path = _a.path, query = _a.query;
        return db_1.lookup.image(__assign(__assign({}, path), query));
    },
    imageDelete: function (_a) {
        var path = _a.path, query = _a.query, cookies = _a.cookies;
        // if it's a silo image, you need silo write to delete it
        if (!query.project) {
            (0, util_2.requireRole)(cookies, 'silo', silo_1.defaultSilo.id, 'collaborator');
        }
        var image = db_1.lookup.image(__assign(__assign({}, path), query));
        db_1.db.images = db_1.db.images.filter(function (i) { return i.id !== image.id; });
        return 204;
    },
    imagePromote: function (_a) {
        var path = _a.path, query = _a.query;
        var image = db_1.lookup.image(__assign(__assign({}, path), query));
        delete image.project_id;
        return (0, msw_handlers_1.json)(image, { status: 202 });
    },
    imageDemote: function (_a) {
        var path = _a.path, query = _a.query;
        var image = db_1.lookup.image(__assign(__assign({}, path), query));
        var project = db_1.lookup.project(__assign(__assign({}, path), query));
        image.project_id = project.id;
        return (0, msw_handlers_1.json)(image, { status: 202 });
    },
    instanceList: function (_a) {
        var query = _a.query;
        var project = db_1.lookup.project(query);
        var instances = db_1.db.instances.filter(function (i) { return i.project_id === project.id; });
        return (0, util_2.paginated)(query, instances);
    },
    instanceCreate: function (_a) {
        var _b, _c, _d;
        var body = _a.body, query = _a.query;
        return __awaiter(this, void 0, void 0, function () {
            var project, instanceId, _i, _e, diskParams, _f, _g, diskParams, size, name_1, description, disk_source, newDisk, disk, anyVpc, anySubnet, newInstance;
            return __generator(this, function (_h) {
                project = db_1.lookup.project(query);
                if (body.name === 'no-default-pool') {
                    throw (0, db_1.notFoundErr)('default IP pool for current silo');
                }
                (0, util_2.errIfExists)(db_1.db.instances, { name: body.name, project_id: project.id }, 'instance');
                instanceId = (0, uuid_1.v4)();
                // TODO: These values should ultimately be represented in the schema and
                // checked with the generated schema validation code.
                if (body.memory > api_1.INSTANCE_MAX_RAM_GiB * util_1.GiB) {
                    throw "Memory must be less than ".concat(api_1.INSTANCE_MAX_RAM_GiB, " GiB");
                }
                if (body.memory < api_1.INSTANCE_MIN_RAM_GiB * util_1.GiB) {
                    throw "Memory must be at least ".concat(api_1.INSTANCE_MIN_RAM_GiB, " GiB");
                }
                if (body.ncpus > api_1.INSTANCE_MAX_CPU) {
                    throw "vCPUs must be less than ".concat(api_1.INSTANCE_MAX_CPU);
                }
                if (body.ncpus < 1) {
                    throw "Must have at least 1 vCPU";
                }
                /**
                 * Eagerly check for disk errors. Execution will stop early and prevent orphaned disks from
                 * being created if there's a failure. In omicron this is done automatically via an undo on the saga.
                 */
                for (_i = 0, _e = body.disks || []; _i < _e.length; _i++) {
                    diskParams = _e[_i];
                    if (diskParams.type === 'create') {
                        (0, util_2.errIfExists)(db_1.db.disks, { name: diskParams.name, project_id: project.id }, 'disk');
                        (0, util_2.errIfInvalidDiskSize)(diskParams);
                    }
                    else {
                        db_1.lookup.disk(__assign(__assign({}, query), { disk: diskParams.name }));
                    }
                }
                /**
                 * Eagerly check for nic lookup failures. Execution will stop early and prevent orphaned nics from
                 * being created if there's a failure. In omicron this is done automatically via an undo on the saga.
                 */
                if (((_b = body.network_interfaces) === null || _b === void 0 ? void 0 : _b.type) === 'create') {
                    if (body.network_interfaces.params.length > api_1.MAX_NICS_PER_INSTANCE) {
                        throw "Cannot create more than ".concat(api_1.MAX_NICS_PER_INSTANCE, " nics per instance");
                    }
                    body.network_interfaces.params.forEach(function (_a) {
                        var vpc_name = _a.vpc_name, subnet_name = _a.subnet_name;
                        db_1.lookup.vpc(__assign(__assign({}, query), { vpc: vpc_name }));
                        db_1.lookup.vpcSubnet(__assign(__assign({}, query), { vpc: vpc_name, subnet: subnet_name }));
                    });
                }
                for (_f = 0, _g = body.disks || []; _f < _g.length; _f++) {
                    diskParams = _g[_f];
                    if (diskParams.type === 'create') {
                        size = diskParams.size, name_1 = diskParams.name, description = diskParams.description, disk_source = diskParams.disk_source;
                        newDisk = __assign({ id: (0, uuid_1.v4)(), name: name_1, description: description, size: size, project_id: project.id, state: { state: 'attached', instance: instanceId }, device_path: '/mnt/disk', block_size: disk_source.type === 'blank' ? disk_source.block_size : 4096 }, (0, util_2.getTimestamps)());
                        db_1.db.disks.push(newDisk);
                    }
                    else {
                        disk = db_1.lookup.disk(__assign(__assign({}, query), { disk: diskParams.name }));
                        disk.state = { state: 'attached', instance: instanceId };
                    }
                }
                anyVpc = db_1.db.vpcs.find(function (v) { return v.project_id === project.id; });
                anySubnet = db_1.db.vpcSubnets.find(function (s) { return s.vpc_id === (anyVpc === null || anyVpc === void 0 ? void 0 : anyVpc.id); });
                if (((_c = body.network_interfaces) === null || _c === void 0 ? void 0 : _c.type) === 'default' && anyVpc && anySubnet) {
                    db_1.db.networkInterfaces.push(__assign({ id: (0, uuid_1.v4)(), description: 'The default network interface', instance_id: instanceId, primary: true, mac: '00:00:00:00:00:00', ip: '127.0.0.1', name: 'default', vpc_id: anyVpc.id, subnet_id: anySubnet.id }, (0, util_2.getTimestamps)()));
                }
                else if (((_d = body.network_interfaces) === null || _d === void 0 ? void 0 : _d.type) === 'create') {
                    body.network_interfaces.params.forEach(function (_a, i) {
                        var name = _a.name, description = _a.description, ip = _a.ip, subnet_name = _a.subnet_name, vpc_name = _a.vpc_name;
                        db_1.db.networkInterfaces.push(__assign({ id: (0, uuid_1.v4)(), name: name, description: description, instance_id: instanceId, primary: i === 0 ? true : false, mac: '00:00:00:00:00:00', ip: ip || '127.0.0.1', vpc_id: db_1.lookup.vpc(__assign(__assign({}, query), { vpc: vpc_name })).id, subnet_id: db_1.lookup.vpcSubnet(__assign(__assign({}, query), { vpc: vpc_name, subnet: subnet_name }))
                                .id }, (0, util_2.getTimestamps)()));
                    });
                }
                newInstance = __assign(__assign(__assign({ id: instanceId, project_id: project.id }, (0, util_1.pick)(body, 'name', 'description', 'hostname', 'memory', 'ncpus')), (0, util_2.getTimestamps)()), { run_state: 'running', time_run_state_updated: new Date().toISOString() });
                db_1.db.instances.push(newInstance);
                return [2 /*return*/, (0, msw_handlers_1.json)(newInstance, { status: 201 })];
            });
        });
    },
    instanceView: function (_a) {
        var path = _a.path, query = _a.query;
        return db_1.lookup.instance(__assign(__assign({}, path), query));
    },
    instanceDelete: function (_a) {
        var path = _a.path, query = _a.query;
        var instance = db_1.lookup.instance(__assign(__assign({}, path), query));
        db_1.db.instances = db_1.db.instances.filter(function (i) { return i.id !== instance.id; });
        return 204;
    },
    instanceDiskList: function (_a) {
        var path = _a.path, query = _a.query;
        var instance = db_1.lookup.instance(__assign(__assign({}, path), query));
        // TODO: Should disk instance state be `instance_id` instead of `instance`?
        var disks = db_1.db.disks.filter(function (d) { return 'instance' in d.state && d.state.instance === instance.id; });
        return (0, util_2.paginated)(query, disks);
    },
    instanceDiskAttach: function (_a) {
        var body = _a.body, path = _a.path, projectParams = _a.query;
        var instance = db_1.lookup.instance(__assign(__assign({}, path), projectParams));
        if (instance.run_state !== 'stopped') {
            throw 'Cannot attach disk to instance that is not stopped';
        }
        var disk = db_1.lookup.disk(__assign(__assign({}, projectParams), { disk: body.disk }));
        disk.state = {
            state: 'attached',
            instance: instance.id,
        };
        return disk;
    },
    instanceDiskDetach: function (_a) {
        var body = _a.body, path = _a.path, projectParams = _a.query;
        var instance = db_1.lookup.instance(__assign(__assign({}, path), projectParams));
        if (instance.run_state !== 'stopped') {
            throw 'Cannot detach disk from instance that is not stopped';
        }
        var disk = db_1.lookup.disk(__assign(__assign({}, projectParams), { disk: body.disk }));
        disk.state = { state: 'detached' };
        return disk;
    },
    instanceExternalIpList: function (_a) {
        var path = _a.path, query = _a.query;
        var instance = db_1.lookup.instance(__assign(__assign({}, path), query));
        var externalIps = db_1.db.externalIps
            .filter(function (eip) { return eip.instance_id === instance.id; })
            .map(function (eip) { return eip.external_ip; });
        // endpoint is not paginated. or rather, it's fake paginated
        return { items: externalIps };
    },
    instanceNetworkInterfaceList: function (_a) {
        var query = _a.query;
        var instance = db_1.lookup.instance(query);
        var nics = db_1.db.networkInterfaces.filter(function (n) { return n.instance_id === instance.id; });
        return (0, util_2.paginated)(query, nics);
    },
    instanceNetworkInterfaceCreate: function (_a) {
        var body = _a.body, query = _a.query;
        var instance = db_1.lookup.instance(query);
        var nicsForInstance = db_1.db.networkInterfaces.filter(function (n) { return n.instance_id === instance.id; });
        (0, util_2.errIfExists)(nicsForInstance, { name: body.name });
        var name = body.name, description = body.description, subnet_name = body.subnet_name, vpc_name = body.vpc_name, ip = body.ip;
        var vpc = db_1.lookup.vpc(__assign(__assign({}, query), { vpc: vpc_name }));
        var subnet = db_1.lookup.vpcSubnet(__assign(__assign({}, query), { vpc: vpc_name, subnet: subnet_name }));
        var newNic = __assign({ id: (0, uuid_1.v4)(), 
            // matches API logic: https://github.com/oxidecomputer/omicron/blob/ae22982/nexus/src/db/queries/network_interface.rs#L982-L1015
            primary: nicsForInstance.length === 0, instance_id: instance.id, name: name, description: description, ip: ip || '123.45.68.8', vpc_id: vpc.id, subnet_id: subnet.id, mac: '' }, (0, util_2.getTimestamps)());
        db_1.db.networkInterfaces.push(newNic);
        return newNic;
    },
    instanceNetworkInterfaceView: function (_a) {
        var path = _a.path, query = _a.query;
        return db_1.lookup.networkInterface(__assign(__assign({}, path), query));
    },
    instanceNetworkInterfaceUpdate: function (_a) {
        var body = _a.body, path = _a.path, query = _a.query;
        var nic = db_1.lookup.networkInterface(__assign(__assign({}, path), query));
        if (body.name) {
            nic.name = body.name;
        }
        if (typeof body.description === 'string') {
            nic.description = body.description;
        }
        if (typeof body.primary === 'boolean' && body.primary !== nic.primary) {
            if (nic.primary) {
                throw 'Cannot remove the primary interface';
            }
            db_1.db.networkInterfaces
                .filter(function (n) { return n.instance_id === nic.instance_id; })
                .forEach(function (n) {
                n.primary = false;
            });
            nic.primary = !!body.primary;
        }
        return nic;
    },
    instanceNetworkInterfaceDelete: function (_a) {
        var path = _a.path, query = _a.query;
        var nic = db_1.lookup.networkInterface(__assign(__assign({}, path), query));
        db_1.db.networkInterfaces = db_1.db.networkInterfaces.filter(function (n) { return n.id !== nic.id; });
        return 204;
    },
    instanceReboot: function (_a) {
        var path = _a.path, query = _a.query;
        var instance = db_1.lookup.instance(__assign(__assign({}, path), query));
        instance.run_state = 'rebooting';
        setTimeout(function () {
            instance.run_state = 'running';
        }, 3000);
        return (0, msw_handlers_1.json)(instance, { status: 202 });
    },
    instanceSerialConsole: function (_params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, msw_1.delay)(3000)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, (0, msw_handlers_1.json)(serial_1.serial)];
                }
            });
        });
    },
    instanceStart: function (_a) {
        var path = _a.path, query = _a.query;
        var instance = db_1.lookup.instance(__assign(__assign({}, path), query));
        instance.run_state = 'running';
        return (0, msw_handlers_1.json)(instance, { status: 202 });
    },
    instanceStop: function (_a) {
        var path = _a.path, query = _a.query;
        var instance = db_1.lookup.instance(__assign(__assign({}, path), query));
        instance.run_state = 'stopped';
        return (0, msw_handlers_1.json)(instance, { status: 202 });
    },
    ipPoolList: function (_a) {
        var query = _a.query;
        return (0, util_2.paginated)(query, db_1.db.ipPools);
    },
    siloIpPoolList: function (_a) {
        var path = _a.path, query = _a.query;
        var pools = db_1.lookup.siloIpPools(path);
        return (0, util_2.paginated)(query, pools);
    },
    projectIpPoolList: function (_a) {
        var query = _a.query;
        var pools = db_1.lookup.siloIpPools({ silo: silo_1.defaultSilo.id });
        return (0, util_2.paginated)(query, pools);
    },
    projectIpPoolView: function (_a) {
        var path = _a.path;
        // this will 404 if it doesn't exist at all...
        var pool = db_1.lookup.ipPool(path);
        // but we also want to 404 if it exists but isn't in the silo
        var link = db_1.db.ipPoolSilos.find(function (link) { return link.ip_pool_id === pool.id && link.silo_id === silo_1.defaultSilo.id; });
        if (!link)
            throw (0, db_1.notFoundErr)();
        return __assign(__assign({}, pool), { is_default: link.is_default });
    },
    // TODO: require admin permissions for system IP pool endpoints
    ipPoolView: function (_a) {
        var path = _a.path;
        return db_1.lookup.ipPool(path);
    },
    ipPoolSiloList: function (_a) {
        // TODO: paginated wants an id field, but this is a join table, so it  has a
        // composite pk
        // return paginated(query, db.ipPoolResources)
        var path = _a.path /*query*/;
        var pool = db_1.lookup.ipPool(path);
        var assocs = db_1.db.ipPoolSilos.filter(function (ipr) { return ipr.ip_pool_id === pool.id; });
        return { items: assocs };
    },
    ipPoolSiloLink: function (_a) {
        var path = _a.path, body = _a.body;
        var pool = db_1.lookup.ipPool(path);
        var silo_id = db_1.lookup.silo({ silo: body.silo }).id;
        var assoc = {
            ip_pool_id: pool.id,
            silo_id: silo_id,
            is_default: body.is_default,
        };
        var alreadyThere = db_1.db.ipPoolSilos.find(function (ips) { return ips.ip_pool_id === pool.id && ips.silo_id === silo_id; });
        // TODO: this matches current API logic but makes no sense because is_default
        // could be different. Need to fix that. Should 400 or 409 on conflict.
        if (!alreadyThere)
            db_1.db.ipPoolSilos.push(assoc);
        return assoc;
    },
    ipPoolSiloUnlink: function (_a) {
        var path = _a.path;
        var pool = db_1.lookup.ipPool(path);
        var silo = db_1.lookup.silo(path);
        // ignore is_default when deleting, it's not part of the pk
        db_1.db.ipPoolSilos = db_1.db.ipPoolSilos.filter(function (ips) { return !(ips.ip_pool_id === pool.id && ips.silo_id === silo.id); });
        return 204;
    },
    ipPoolSiloUpdate: function (_a) {
        var path = _a.path, body = _a.body;
        var ipPoolSilo = db_1.lookup.ipPoolSiloLink(path);
        // if we're setting default, we need to set is_default false on the existing default
        if (body.is_default) {
            var silo_2 = db_1.lookup.silo(path);
            var existingDefault = db_1.db.ipPoolSilos.find(function (ips) { return ips.silo_id === silo_2.id && ips.is_default; });
            if (existingDefault) {
                existingDefault.is_default = false;
            }
        }
        ipPoolSilo.is_default = body.is_default;
        return ipPoolSilo;
    },
    ipPoolRangeList: function (_a) {
        var path = _a.path, query = _a.query;
        var pool = db_1.lookup.ipPool(path);
        var ranges = db_1.db.ipPoolRanges.filter(function (r) { return r.ip_pool_id === pool.id; });
        return (0, util_2.paginated)(query, ranges);
    },
    ipPoolRangeAdd: function (_a) {
        var path = _a.path, body = _a.body;
        var pool = db_1.lookup.ipPool(path);
        var newRange = {
            id: (0, uuid_1.v4)(),
            ip_pool_id: pool.id,
            range: body,
            time_created: new Date().toISOString(),
        };
        // TODO: validate that it doesn't overlap with existing ranges
        db_1.db.ipPoolRanges.push(newRange);
        return (0, msw_handlers_1.json)(newRange, { status: 201 });
    },
    ipPoolRangeRemove: function (_a) {
        var path = _a.path, body = _a.body;
        var pool = db_1.lookup.ipPool(path);
        var idsToDelete = db_1.db.ipPoolRanges
            .filter(function (r) {
            return r.ip_pool_id === pool.id &&
                r.range.first === body.first &&
                r.range.last === body.last;
        })
            .map(function (r) { return r.id; });
        // if nothing in the DB matches, 404
        if (idsToDelete.length === 0)
            throw (0, db_1.notFoundErr)();
        db_1.db.ipPoolRanges = db_1.db.ipPoolRanges.filter(function (r) { return !idsToDelete.includes(r.id); });
        return 204;
    },
    ipPoolCreate: function (_a) {
        var body = _a.body;
        (0, util_2.errIfExists)(db_1.db.ipPools, { name: body.name }, 'IP pool');
        var newPool = __assign(__assign({ id: (0, uuid_1.v4)() }, body), (0, util_2.getTimestamps)());
        db_1.db.ipPools.push(newPool);
        return (0, msw_handlers_1.json)(newPool, { status: 201 });
    },
    ipPoolDelete: function (_a) {
        var path = _a.path;
        var pool = db_1.lookup.ipPool(path);
        if (db_1.db.ipPoolRanges.some(function (r) { return r.ip_pool_id === pool.id; })) {
            throw 'IP pool cannot be deleted while it contains IP ranges';
        }
        // delete pools and silo links
        db_1.db.ipPools = db_1.db.ipPools.filter(function (p) { return p.id !== pool.id; });
        db_1.db.ipPoolSilos = db_1.db.ipPoolSilos.filter(function (s) { return s.ip_pool_id !== pool.id; });
        return 204;
    },
    ipPoolUpdate: function (_a) {
        var path = _a.path, body = _a.body;
        var pool = db_1.lookup.ipPool(path);
        if (body.name) {
            // only check for existing name if it's being changed
            if (body.name !== pool.name) {
                (0, util_2.errIfExists)(db_1.db.ipPools, { name: body.name });
            }
            pool.name = body.name;
        }
        pool.description = body.description || '';
        return pool;
    },
    projectPolicyView: function (_a) {
        var path = _a.path;
        var project = db_1.lookup.project(path);
        var role_assignments = db_1.db.roleAssignments
            .filter(function (r) { return r.resource_type === 'project' && r.resource_id === project.id; })
            .map(function (r) { return (0, util_1.pick)(r, 'identity_id', 'identity_type', 'role_name'); });
        return { role_assignments: role_assignments };
    },
    projectPolicyUpdate: function (_a) {
        var body = _a.body, path = _a.path;
        var project = db_1.lookup.project(path);
        var newAssignments = body.role_assignments.map(function (r) { return (__assign({ resource_type: 'project', resource_id: project.id }, (0, util_1.pick)(r, 'identity_id', 'identity_type', 'role_name'))); });
        var unrelatedAssignments = db_1.db.roleAssignments.filter(function (r) { return !(r.resource_type === 'project' && r.resource_id === project.id); });
        db_1.db.roleAssignments = __spreadArray(__spreadArray([], unrelatedAssignments, true), newAssignments, true);
        // TODO: Is this the right thing to return?
        return body;
    },
    snapshotList: function (params) {
        var project = db_1.lookup.project(params.query);
        var snapshots = db_1.db.snapshots.filter(function (i) { return i.project_id === project.id; });
        return (0, util_2.paginated)(params.query, snapshots);
    },
    snapshotCreate: function (_a) {
        var body = _a.body, query = _a.query;
        var project = db_1.lookup.project(query);
        if (body.disk === 'disk-snapshot-error') {
            throw 'Cannot snapshot disk';
        }
        (0, util_2.errIfExists)(db_1.db.snapshots, { name: body.name });
        var disk = db_1.lookup.disk(__assign(__assign({}, query), { disk: body.disk }));
        if (!api_1.diskCan.snapshot(disk)) {
            throw 'Cannot snapshot disk in state ' + disk.state.state;
        }
        var newSnapshot = __assign(__assign(__assign({ id: (0, uuid_1.v4)() }, body), (0, util_2.getTimestamps)()), { state: 'ready', project_id: project.id, disk_id: disk.id, size: disk.size });
        db_1.db.snapshots.push(newSnapshot);
        return (0, msw_handlers_1.json)(newSnapshot, { status: 201 });
    },
    snapshotView: function (_a) {
        var path = _a.path, query = _a.query;
        return db_1.lookup.snapshot(__assign(__assign({}, path), query));
    },
    snapshotDelete: function (_a) {
        var path = _a.path, query = _a.query;
        if (path.snapshot === 'delete-500')
            return 500;
        var snapshot = db_1.lookup.snapshot(__assign(__assign({}, path), query));
        db_1.db.snapshots = db_1.db.snapshots.filter(function (s) { return s.id !== snapshot.id; });
        return 204;
    },
    utilizationView: function () {
        var _a = (0, db_1.utilizationForSilo)(silo_1.defaultSilo), capacity = _a.allocated, provisioned = _a.provisioned;
        return { capacity: capacity, provisioned: provisioned };
    },
    siloUtilizationView: function (_a) {
        var path = _a.path;
        var silo = db_1.lookup.silo(path);
        return (0, db_1.utilizationForSilo)(silo);
    },
    siloUtilizationList: function (_a) {
        var query = _a.query;
        var _b = (0, util_2.paginated)(query, db_1.db.silos), silos = _b.items, nextPage = _b.nextPage;
        return {
            items: silos.map(db_1.utilizationForSilo),
            nextPage: nextPage,
        };
    },
    vpcList: function (_a) {
        var query = _a.query;
        var project = db_1.lookup.project(query);
        var vpcs = db_1.db.vpcs.filter(function (v) { return v.project_id === project.id; });
        return (0, util_2.paginated)(query, vpcs);
    },
    vpcCreate: function (_a) {
        var body = _a.body, query = _a.query;
        var project = db_1.lookup.project(query);
        (0, util_2.errIfExists)(db_1.db.vpcs, { name: body.name });
        var newVpc = __assign(__assign(__assign({ id: (0, uuid_1.v4)(), project_id: project.id, system_router_id: (0, uuid_1.v4)() }, body), { 
            // API is supposed to generate one if none provided. close enough
            ipv6_prefix: body.ipv6_prefix || 'fd2d:4569:88b2::/64' }), (0, util_2.getTimestamps)());
        db_1.db.vpcs.push(newVpc);
        // Also create a default subnet
        var newSubnet = __assign({ id: (0, uuid_1.v4)(), name: 'default', vpc_id: newVpc.id, ipv6_block: 'fd2d:4569:88b1::/64', description: '', ipv4_block: '' }, (0, util_2.getTimestamps)());
        db_1.db.vpcSubnets.push(newSubnet);
        return (0, msw_handlers_1.json)(newVpc, { status: 201 });
    },
    vpcView: function (_a) {
        var path = _a.path, query = _a.query;
        return db_1.lookup.vpc(__assign(__assign({}, path), query));
    },
    vpcUpdate: function (_a) {
        var body = _a.body, path = _a.path, query = _a.query;
        var vpc = db_1.lookup.vpc(__assign(__assign({}, path), query));
        if (body.name) {
            vpc.name = body.name;
        }
        if (typeof body.description === 'string') {
            vpc.description = body.description;
        }
        if (body.dns_name) {
            vpc.dns_name = body.dns_name;
        }
        return vpc;
    },
    vpcDelete: function (_a) {
        var path = _a.path, query = _a.query;
        var vpc = db_1.lookup.vpc(__assign(__assign({}, path), query));
        db_1.db.vpcs = db_1.db.vpcs.filter(function (v) { return v.id !== vpc.id; });
        db_1.db.vpcSubnets = db_1.db.vpcSubnets.filter(function (s) { return s.vpc_id !== vpc.id; });
        db_1.db.vpcFirewallRules = db_1.db.vpcFirewallRules.filter(function (r) { return r.vpc_id !== vpc.id; });
        return 204;
    },
    vpcFirewallRulesView: function (_a) {
        var query = _a.query;
        var vpc = db_1.lookup.vpc(query);
        var rules = db_1.db.vpcFirewallRules.filter(function (r) { return r.vpc_id === vpc.id; });
        return { rules: (0, util_1.sortBy)(rules, function (r) { return r.name; }) };
    },
    vpcFirewallRulesUpdate: function (_a) {
        var body = _a.body, query = _a.query;
        var vpc = db_1.lookup.vpc(query);
        var rules = body.rules.map(function (rule) { return (__assign(__assign({ vpc_id: vpc.id, id: (0, uuid_1.v4)() }, rule), (0, util_2.getTimestamps)())); });
        // replace existing rules for this VPC with the new ones
        db_1.db.vpcFirewallRules = __spreadArray(__spreadArray([], db_1.db.vpcFirewallRules.filter(function (r) { return r.vpc_id !== vpc.id; }), true), rules, true);
        return { rules: (0, util_1.sortBy)(rules, function (r) { return r.name; }) };
    },
    vpcSubnetList: function (_a) {
        var query = _a.query;
        var vpc = db_1.lookup.vpc(query);
        var subnets = db_1.db.vpcSubnets.filter(function (s) { return s.vpc_id === vpc.id; });
        return (0, util_2.paginated)(query, subnets);
    },
    vpcSubnetCreate: function (_a) {
        var body = _a.body, query = _a.query;
        var vpc = db_1.lookup.vpc(query);
        (0, util_2.errIfExists)(db_1.db.vpcSubnets, { vpc_id: vpc.id, name: body.name });
        // TODO: Create a route for the subnet in the default router
        var newSubnet = __assign(__assign(__assign({ id: (0, uuid_1.v4)(), vpc_id: vpc.id }, body), { 
            // required in subnet create but not in update, so we need a fallback.
            // API says "A random `/64` block will be assigned if one is not
            // provided." Our fallback is not random, but it should be good enough.
            ipv6_block: body.ipv6_block || 'fd2d:4569:88b1::/64' }), (0, util_2.getTimestamps)());
        db_1.db.vpcSubnets.push(newSubnet);
        return (0, msw_handlers_1.json)(newSubnet, { status: 201 });
    },
    vpcSubnetView: function (_a) {
        var path = _a.path, query = _a.query;
        return db_1.lookup.vpcSubnet(__assign(__assign({}, path), query));
    },
    vpcSubnetUpdate: function (_a) {
        var body = _a.body, path = _a.path, query = _a.query;
        var subnet = db_1.lookup.vpcSubnet(__assign(__assign({}, path), query));
        if (body.name) {
            subnet.name = body.name;
        }
        if (typeof body.description === 'string') {
            subnet.description = body.description;
        }
        return subnet;
    },
    vpcSubnetDelete: function (_a) {
        var path = _a.path, query = _a.query;
        var subnet = db_1.lookup.vpcSubnet(__assign(__assign({}, path), query));
        db_1.db.vpcSubnets = db_1.db.vpcSubnets.filter(function (s) { return s.id !== subnet.id; });
        return 204;
    },
    vpcSubnetListNetworkInterfaces: function (_a) {
        var path = _a.path, query = _a.query;
        var subnet = db_1.lookup.vpcSubnet(__assign(__assign({}, path), query));
        var nics = db_1.db.networkInterfaces.filter(function (n) { return n.subnet_id === subnet.id; });
        return (0, util_2.paginated)(query, nics);
    },
    sledPhysicalDiskList: function (_a) {
        var path = _a.path, query = _a.query, cookies = _a.cookies;
        (0, util_2.requireFleetViewer)(cookies);
        var sled = db_1.lookup.sled(path);
        var disks = db_1.db.physicalDisks.filter(function (n) { return n.sled_id === sled.id; });
        return (0, util_2.paginated)(query, disks);
    },
    physicalDiskList: function (_a) {
        var query = _a.query, cookies = _a.cookies;
        (0, util_2.requireFleetViewer)(cookies);
        return (0, util_2.paginated)(query, db_1.db.physicalDisks);
    },
    policyView: function () {
        // assume we're in the default silo
        var siloId = silo_1.defaultSilo.id;
        var role_assignments = db_1.db.roleAssignments
            .filter(function (r) { return r.resource_type === 'silo' && r.resource_id === siloId; })
            .map(function (r) { return (0, util_1.pick)(r, 'identity_id', 'identity_type', 'role_name'); });
        return { role_assignments: role_assignments };
    },
    policyUpdate: function (_a) {
        var body = _a.body;
        var siloId = silo_1.defaultSilo.id;
        var newAssignments = body.role_assignments.map(function (r) { return (__assign({ resource_type: 'silo', resource_id: siloId }, (0, util_1.pick)(r, 'identity_id', 'identity_type', 'role_name'))); });
        var unrelatedAssignments = db_1.db.roleAssignments.filter(function (r) { return !(r.resource_type === 'silo' && r.resource_id === siloId); });
        db_1.db.roleAssignments = __spreadArray(__spreadArray([], unrelatedAssignments, true), newAssignments, true);
        return body;
    },
    rackList: function (_a) {
        var query = _a.query, cookies = _a.cookies;
        (0, util_2.requireFleetViewer)(cookies);
        return (0, util_2.paginated)(query, db_1.db.racks);
    },
    currentUserView: function (_a) {
        var cookies = _a.cookies;
        return __assign(__assign({}, (0, util_2.currentUser)(cookies)), { silo_name: silo_1.defaultSilo.name });
    },
    currentUserGroups: function (_a) {
        var cookies = _a.cookies;
        var user = (0, util_2.currentUser)(cookies);
        var memberships = db_1.db.groupMemberships.filter(function (gm) { return gm.userId === user.id; });
        var groupIds = new Set(memberships.map(function (gm) { return gm.groupId; }));
        var groups = db_1.db.userGroups.filter(function (g) { return groupIds.has(g.id); });
        return { items: groups };
    },
    currentUserSshKeyList: function (_a) {
        var query = _a.query, cookies = _a.cookies;
        var user = (0, util_2.currentUser)(cookies);
        var keys = db_1.db.sshKeys.filter(function (k) { return k.silo_user_id === user.id; });
        return (0, util_2.paginated)(query, keys);
    },
    currentUserSshKeyCreate: function (_a) {
        var body = _a.body, cookies = _a.cookies;
        var user = (0, util_2.currentUser)(cookies);
        (0, util_2.errIfExists)(db_1.db.sshKeys, { silo_user_id: user.id, name: body.name });
        var newSshKey = __assign(__assign({ id: (0, uuid_1.v4)(), silo_user_id: user.id }, body), (0, util_2.getTimestamps)());
        db_1.db.sshKeys.push(newSshKey);
        return (0, msw_handlers_1.json)(newSshKey, { status: 201 });
    },
    currentUserSshKeyView: function (_a) {
        var path = _a.path;
        return db_1.lookup.sshKey(path);
    },
    currentUserSshKeyDelete: function (_a) {
        var path = _a.path;
        var sshKey = db_1.lookup.sshKey(path);
        db_1.db.sshKeys = db_1.db.sshKeys.filter(function (i) { return i.id !== sshKey.id; });
        return 204;
    },
    sledView: function (_a) {
        var path = _a.path, cookies = _a.cookies;
        (0, util_2.requireFleetViewer)(cookies);
        return db_1.lookup.sled(path);
    },
    sledList: function (_a) {
        var query = _a.query, cookies = _a.cookies;
        (0, util_2.requireFleetViewer)(cookies);
        return (0, util_2.paginated)(query, db_1.db.sleds);
    },
    sledInstanceList: function (_a) {
        var query = _a.query, path = _a.path, cookies = _a.cookies;
        (0, util_2.requireFleetViewer)(cookies);
        var sled = (0, db_1.lookupById)(db_1.db.sleds, path.sledId);
        return (0, util_2.paginated)(query, db_1.db.instances.map(function (i) {
            var project = (0, db_1.lookupById)(db_1.db.projects, i.project_id);
            return __assign(__assign({}, (0, util_1.pick)(i, 'id', 'name', 'time_created', 'time_modified', 'memory', 'ncpus')), { state: 'running', active_sled_id: sled.id, project_name: project.name, silo_name: silo_1.defaultSilo.name });
        }));
    },
    siloList: function (_a) {
        var query = _a.query, cookies = _a.cookies;
        (0, util_2.requireFleetViewer)(cookies);
        return (0, util_2.paginated)(query, db_1.db.silos);
    },
    siloCreate: function (_a) {
        var body = _a.body, cookies = _a.cookies;
        (0, util_2.requireFleetViewer)(cookies);
        (0, util_2.errIfExists)(db_1.db.silos, { name: body.name });
        var newSilo = __assign(__assign(__assign({ id: (0, uuid_1.v4)() }, (0, util_2.getTimestamps)()), body), { mapped_fleet_roles: body.mapped_fleet_roles || {} });
        db_1.db.silos.push(newSilo);
        return (0, msw_handlers_1.json)(newSilo, { status: 201 });
    },
    siloView: function (_a) {
        var path = _a.path, cookies = _a.cookies;
        (0, util_2.requireFleetViewer)(cookies);
        return db_1.lookup.silo(path);
    },
    siloDelete: function (_a) {
        var path = _a.path, cookies = _a.cookies;
        (0, util_2.requireFleetViewer)(cookies);
        var silo = db_1.lookup.silo(path);
        db_1.db.silos = db_1.db.silos.filter(function (i) { return i.id !== silo.id; });
        db_1.db.ipPoolSilos = db_1.db.ipPoolSilos.filter(function (i) { return i.silo_id !== silo.id; });
        return 204;
    },
    siloIdentityProviderList: function (_a) {
        var query = _a.query, cookies = _a.cookies;
        (0, util_2.requireFleetViewer)(cookies);
        var silo = db_1.lookup.silo(query);
        var idps = db_1.db.identityProviders.filter(function (_a) {
            var siloId = _a.siloId;
            return siloId === silo.id;
        }).map(silo_1.toIdp);
        return { items: idps };
    },
    samlIdentityProviderCreate: function (_a) {
        var _b;
        var query = _a.query, body = _a.body, cookies = _a.cookies;
        (0, util_2.requireFleetViewer)(cookies);
        var silo = db_1.lookup.silo(query);
        // this is a bit silly, but errIfExists doesn't handle nested keys like
        // provider.name, so to do the check we make a flatter object
        (0, util_2.errIfExists)(db_1.db.identityProviders.map(function (_a) {
            var siloId = _a.siloId, provider = _a.provider;
            return ({ siloId: siloId, name: provider.name });
        }), { siloId: silo.id, name: body.name });
        // we just decode to string and store that, which is probably fine for local
        // dev, but note that the API decodes to bytes and passes that to
        // https://docs.rs/openssl/latest/openssl/x509/struct.X509.html#method.from_der
        // and that will error if can't be parsed that way
        var public_cert = (_b = body.signing_keypair) === null || _b === void 0 ? void 0 : _b.public_cert;
        public_cert = public_cert ? atob(public_cert) : undefined;
        // we ignore the private key because it's not returned in the get response,
        // so you'll never see it again. But worth noting that in the real thing
        // it is parsed with this
        // https://docs.rs/openssl/latest/openssl/rsa/struct.Rsa.html#method.private_key_from_der
        var provider = __assign(__assign(__assign({ id: (0, uuid_1.v4)() }, (0, util_1.pick)(body, 'name', 'acs_url', 'description', 'idp_entity_id', 'slo_url', 'sp_client_id', 'technical_contact_email')), { public_cert: public_cert }), (0, util_2.getTimestamps)());
        db_1.db.identityProviders.push({ type: 'saml', siloId: silo.id, provider: provider });
        return provider;
    },
    samlIdentityProviderView: function (_a) {
        var path = _a.path, query = _a.query;
        return db_1.lookup.samlIdp(__assign(__assign({}, path), query));
    },
    userList: function (_a) {
        var query = _a.query;
        // query.group is validated by generated code to be a UUID if present
        if (query.group) {
            var group_1 = (0, db_1.lookupById)(db_1.db.userGroups, query.group); // 404 if doesn't exist
            var memberships = db_1.db.groupMemberships.filter(function (gm) { return gm.groupId === group_1.id; });
            var userIds_1 = new Set(memberships.map(function (gm) { return gm.userId; }));
            var users = db_1.db.users.filter(function (u) { return userIds_1.has(u.id); });
            return (0, util_2.paginated)(query, users);
        }
        return (0, util_2.paginated)(query, db_1.db.users);
    },
    systemPolicyView: function (_a) {
        var cookies = _a.cookies;
        (0, util_2.requireFleetViewer)(cookies);
        var role_assignments = db_1.db.roleAssignments
            .filter(function (r) { return r.resource_type === 'fleet' && r.resource_id === api_1.FLEET_ID; })
            .map(function (r) { return (0, util_1.pick)(r, 'identity_id', 'identity_type', 'role_name'); });
        return { role_assignments: role_assignments };
    },
    systemMetric: function (params) {
        (0, util_2.requireFleetViewer)(params.cookies);
        return (0, util_2.handleMetrics)(params);
    },
    siloMetric: util_2.handleMetrics,
    // Misc endpoints we're not using yet in the console
    certificateCreate: util_2.NotImplemented,
    certificateDelete: util_2.NotImplemented,
    certificateList: util_2.NotImplemented,
    certificateView: util_2.NotImplemented,
    floatingIpAttach: util_2.NotImplemented,
    floatingIpCreate: util_2.NotImplemented,
    floatingIpDelete: util_2.NotImplemented,
    floatingIpDetach: util_2.NotImplemented,
    floatingIpList: util_2.NotImplemented,
    floatingIpView: util_2.NotImplemented,
    instanceEphemeralIpDetach: util_2.NotImplemented,
    instanceEphemeralIpAttach: util_2.NotImplemented,
    instanceMigrate: util_2.NotImplemented,
    instanceSerialConsoleStream: util_2.NotImplemented,
    instanceSshPublicKeyList: util_2.NotImplemented,
    ipPoolServiceRangeAdd: util_2.NotImplemented,
    ipPoolServiceRangeList: util_2.NotImplemented,
    ipPoolServiceRangeRemove: util_2.NotImplemented,
    ipPoolServiceView: util_2.NotImplemented,
    localIdpUserCreate: util_2.NotImplemented,
    localIdpUserDelete: util_2.NotImplemented,
    localIdpUserSetPassword: util_2.NotImplemented,
    loginSaml: util_2.NotImplemented,
    logout: util_2.NotImplemented,
    networkingAddressLotBlockList: util_2.NotImplemented,
    networkingAddressLotCreate: util_2.NotImplemented,
    networkingAddressLotDelete: util_2.NotImplemented,
    networkingAddressLotList: util_2.NotImplemented,
    networkingBfdDisable: util_2.NotImplemented,
    networkingBfdEnable: util_2.NotImplemented,
    networkingBfdStatus: util_2.NotImplemented,
    networkingBgpAnnounceSetCreate: util_2.NotImplemented,
    networkingBgpAnnounceSetDelete: util_2.NotImplemented,
    networkingBgpAnnounceSetList: util_2.NotImplemented,
    networkingBgpConfigCreate: util_2.NotImplemented,
    networkingBgpConfigDelete: util_2.NotImplemented,
    networkingBgpConfigList: util_2.NotImplemented,
    networkingBgpImportedRoutesIpv4: util_2.NotImplemented,
    networkingBgpStatus: util_2.NotImplemented,
    networkingLoopbackAddressCreate: util_2.NotImplemented,
    networkingLoopbackAddressDelete: util_2.NotImplemented,
    networkingLoopbackAddressList: util_2.NotImplemented,
    networkingSwitchPortApplySettings: util_2.NotImplemented,
    networkingSwitchPortClearSettings: util_2.NotImplemented,
    networkingSwitchPortList: util_2.NotImplemented,
    networkingSwitchPortSettingsCreate: util_2.NotImplemented,
    networkingSwitchPortSettingsDelete: util_2.NotImplemented,
    networkingSwitchPortSettingsView: util_2.NotImplemented,
    networkingSwitchPortSettingsList: util_2.NotImplemented,
    rackView: util_2.NotImplemented,
    roleList: util_2.NotImplemented,
    roleView: util_2.NotImplemented,
    siloPolicyUpdate: util_2.NotImplemented,
    siloPolicyView: util_2.NotImplemented,
    siloQuotasUpdate: util_2.NotImplemented,
    siloQuotasView: util_2.NotImplemented,
    siloUserList: util_2.NotImplemented,
    siloUserView: util_2.NotImplemented,
    sledAdd: util_2.NotImplemented,
    sledListUninitialized: util_2.NotImplemented,
    sledSetProvisionState: util_2.NotImplemented,
    switchList: util_2.NotImplemented,
    switchView: util_2.NotImplemented,
    systemPolicyUpdate: util_2.NotImplemented,
    systemQuotasList: util_2.NotImplemented,
    userBuiltinList: util_2.NotImplemented,
    userBuiltinView: util_2.NotImplemented,
});
