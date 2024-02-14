"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genI64Data = exports.genCumulativeI64Data = void 0;
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
var date_fns_1 = require("date-fns");
/** evenly distribute the `values` across the time interval */
var genCumulativeI64Data = function (values, startTime, endTime) {
    var intervalSeconds = (0, date_fns_1.differenceInSeconds)(endTime, startTime) / values.length;
    return values.map(function (value, i) { return ({
        datum: {
            datum: {
                value: value,
                start_time: startTime.toISOString(),
            },
            type: 'cumulative_i64',
        },
        timestamp: (0, date_fns_1.addSeconds)(startTime, i * intervalSeconds).toISOString(),
    }); });
};
exports.genCumulativeI64Data = genCumulativeI64Data;
var genI64Data = function (values, startTime, endTime) {
    var intervalSeconds = (0, date_fns_1.differenceInSeconds)(endTime, startTime) / values.length;
    return values.map(function (value, i) { return ({
        datum: {
            datum: value,
            type: 'i64',
        },
        timestamp: (0, date_fns_1.addSeconds)(startTime, i * intervalSeconds).toISOString(),
    }); });
};
exports.genI64Data = genI64Data;
