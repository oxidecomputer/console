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
Object.defineProperty(exports, "__esModule", { value: true });
exports.toIdp = exports.identityProviders = exports.samlIdp = exports.siloProvisioned = exports.siloQuotas = exports.defaultSilo = exports.silos = void 0;
var util_1 = require("@oxide/util");
exports.silos = [
    {
        id: '6d3a9c06-475e-4f75-b272-c0d0e3f980fa',
        name: 'maze-war',
        description: 'a silo',
        time_created: new Date(2021, 3, 1).toISOString(),
        time_modified: new Date(2021, 4, 2).toISOString(),
        discoverable: true,
        identity_mode: 'saml_jit',
        mapped_fleet_roles: {
            admin: ['admin'],
        },
    },
    {
        id: '68b58556-15b9-4ccb-adff-9fd3c7de1f9a',
        name: 'myriad',
        description: 'a second silo',
        time_created: new Date(2023, 1, 28).toISOString(),
        time_modified: new Date(2023, 6, 12).toISOString(),
        discoverable: true,
        identity_mode: 'saml_jit',
        mapped_fleet_roles: {},
    },
];
exports.defaultSilo = exports.silos[0];
exports.siloQuotas = [
    {
        silo_id: exports.silos[0].id,
        cpus: 50,
        memory: 300 * util_1.GiB,
        storage: 7 * util_1.TiB,
    },
    {
        silo_id: exports.silos[1].id,
        cpus: 34,
        memory: 500 * util_1.GiB,
        storage: 9 * util_1.TiB,
    },
];
// unlike siloQuotas, this doesn't exactly match how it's done in Nexus, but
// it's good enough. All we need is to be able to pull the provisioned amounts
// for a given silo. Note it has the same shape as the quotas object.
exports.siloProvisioned = [
    {
        silo_id: exports.silos[0].id,
        cpus: 30,
        memory: 234 * util_1.GiB,
        storage: 4.3 * util_1.TiB,
    },
    {
        silo_id: exports.silos[1].id,
        cpus: 8,
        memory: 150 * util_1.GiB,
        storage: 2 * util_1.TiB,
    },
];
exports.samlIdp = {
    id: '2a96ce6f-c178-4631-9cde-607d65b539c7',
    description: 'An identity provider but what if it had a really long description',
    name: 'mock-idp',
    time_created: new Date(2021, 4, 3, 4).toISOString(),
    time_modified: new Date(2021, 4, 3, 5).toISOString(),
    acs_url: '',
    idp_entity_id: '',
    public_cert: '',
    slo_url: '',
    sp_client_id: '',
    technical_contact_email: '',
};
exports.identityProviders = [
    { type: 'saml', siloId: exports.defaultSilo.id, provider: exports.samlIdp },
];
/**
 * Extract generic `IdentityProvider` from a specific `*IdentityProvider`
 * type like `SamlIdentityProvider`
 */
var toIdp = function (_a) {
    var provider = _a.provider, type = _a.type;
    return (__assign({ provider_type: type }, (0, util_1.pick)(provider, 'id', 'name', 'description', 'time_created', 'time_modified')));
};
exports.toIdp = toIdp;
