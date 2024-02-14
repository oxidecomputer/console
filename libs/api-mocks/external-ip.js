"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.externalIps = void 0;
var instance_1 = require("./instance");
// TODO: this type represents the API response, but we need to mock more
// structure in order to be able to look up IPs for a particular instance
exports.externalIps = [
    {
        instance_id: instance_1.instances[0].id,
        external_ip: {
            ip: "123.4.56.0",
            kind: 'ephemeral',
        },
    },
    // middle one has no IPs
    {
        instance_id: instance_1.instances[2].id,
        external_ip: {
            ip: "123.4.56.1",
            kind: 'ephemeral',
        },
    },
    {
        instance_id: instance_1.instances[2].id,
        external_ip: {
            ip: "123.4.56.2",
            kind: 'ephemeral',
        },
    },
    {
        instance_id: instance_1.instances[2].id,
        external_ip: {
            ip: "123.4.56.3",
            kind: 'ephemeral',
        },
    },
];
