"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupMemberships = exports.userGroups = exports.userGroup3 = exports.userGroup2 = exports.userGroup1 = void 0;
var silo_1 = require("./silo");
var user_1 = require("./user");
exports.userGroup1 = {
    id: '0ff6da96-5d6d-4326-b059-2b72c1b51457',
    silo_id: silo_1.defaultSilo.id,
    display_name: 'web-devs',
};
exports.userGroup2 = {
    id: '1b5fa004-a378-4225-960f-60f089684b05',
    silo_id: silo_1.defaultSilo.id,
    display_name: 'kernel-devs',
};
exports.userGroup3 = {
    id: '5e30797c-cae3-4402-aeb7-d5044c4bed29',
    silo_id: silo_1.defaultSilo.id,
    display_name: 'real-estate-devs',
};
exports.userGroups = [exports.userGroup1, exports.userGroup2, exports.userGroup3];
exports.groupMemberships = [
    {
        userId: user_1.user1.id,
        groupId: exports.userGroup1.id,
    },
    {
        userId: user_1.user2.id,
        groupId: exports.userGroup3.id,
    },
];
