"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.networkInterface = void 0;
var instance_1 = require("./instance");
var vpc_1 = require("./vpc");
exports.networkInterface = {
    id: 'f6d63297-287c-4035-b262-e8303cfd6a0f',
    name: 'my-nic',
    description: 'a network interface',
    primary: true,
    instance_id: instance_1.instance.id,
    ip: '172.30.0.10',
    mac: '',
    subnet_id: vpc_1.vpcSubnet.id,
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    vpc_id: vpc_1.vpc.id,
};
