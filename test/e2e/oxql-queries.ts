/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

export const oxqlQueries = {
  basicTctl: `get hardware_component:amd_cpu_tctl
  | filter timestamp > @now() - 1m`,
  unalignedTables: `{
  get hardware_component:temperature;
  get hardware_component:sensor_error_count
}
  | filter timestamp > @now() - 1m`,
  multiJoinedTables: `{
  {
    get sled_data_link:bytes_sent;
    get sled_data_link:errors_sent
  }
    | align mean_within(20s)
    | join;
  {
    get sled_data_link:bytes_received;
    get sled_data_link:errors_received
  }
    | align mean_within(20s)
    | join
}
  | filter kind == 'vnic'
  | filter timestamp > @now() - 10m`,
  bytesSentAndReceived: `{
  get sled_data_link:bytes_sent
    | align mean_within(5s)
    | group_by [sled_serial, link_name, kind];
  get sled_data_link:bytes_received
    | align mean_within(5s)
    | group_by [sled_serial, link_name, kind]
}
  | filter timestamp > @now() - 10m
  | filter kind == 'vnic'
  | filter link_name == 'oxControlService20'`,
}
