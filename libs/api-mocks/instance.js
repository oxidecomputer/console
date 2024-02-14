"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.instances = exports.instance = void 0;
var project_1 = require("./project");
exports.instance = {
    id: '935499b3-fd96-432a-9c21-83a3dc1eece4',
    name: 'db1',
    ncpus: 7,
    memory: 1024 * 1024 * 256,
    description: 'an instance',
    hostname: 'oxide.com',
    project_id: project_1.project.id,
    run_state: 'running',
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    time_run_state_updated: new Date().toISOString(),
};
var failedInstance = {
    id: 'b5946edc-5bed-4597-88ab-9a8beb9d32a4',
    name: 'you-fail',
    ncpus: 7,
    memory: 1024 * 1024 * 256,
    description: 'a failed instance',
    hostname: 'oxide.com',
    project_id: project_1.project.id,
    run_state: 'failed',
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    time_run_state_updated: new Date().toISOString(),
};
var startingInstance = {
    id: '16737f54-1f76-4c96-8b7c-9d24971c1d62',
    name: 'not-there-yet',
    ncpus: 7,
    memory: 1024 * 1024 * 256,
    description: 'a starting instance',
    hostname: 'oxide.com',
    project_id: project_1.project.id,
    run_state: 'starting',
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    time_run_state_updated: new Date().toISOString(),
};
exports.instances = [exports.instance, failedInstance, startingInstance];
