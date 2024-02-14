"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectRolePolicy = exports.projects = exports.project2 = exports.project = void 0;
var user_1 = require("./user");
exports.project = {
    id: '5fbab865-3d09-4c16-a22f-ca9c312b0286',
    name: 'mock-project',
    description: 'a fake project',
    time_created: new Date(2021, 0, 1).toISOString(),
    time_modified: new Date(2021, 0, 2).toISOString(),
};
exports.project2 = {
    id: 'e7bd835e-831e-4257-b600-f1db32844c8c',
    name: 'other-project',
    description: 'another fake project',
    time_created: new Date(2021, 0, 15).toISOString(),
    time_modified: new Date(2021, 0, 16).toISOString(),
};
exports.projects = [exports.project, exports.project2];
exports.projectRolePolicy = {
    role_assignments: [
        {
            identity_id: user_1.user1.id,
            identity_type: 'silo_user',
            role_name: 'admin',
        },
    ],
};
