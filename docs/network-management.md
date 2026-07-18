# Network Management Engine

## Architecture

Network services are read-only projections over the verified Huawei snapshot. They never call guessed firmware endpoints and never simulate mutations.

```text
Huawei driver → verified RouterSnapshot → isolated network services
                                      ├─ REST `/api/v1/network/*`
                                      ├─ SQLite observation history
                                      └─ existing WebSocket snapshot events
```

## API map

`GET /api/v1/network/{module}` supports `wan`, `lan`, `wifi`, `guest-wifi`, `dhcp`, `dns`, `nat`, `port-forwarding`, `dmz`, `upnp`, `ipv6`, `routes`, `arp`, and `interfaces`. `GET /api/v1/network/:module/history` returns recorded observations. `PATCH /api/v1/network/:module` is deliberately disabled until a verified Huawei write flow and rollback verification exist.

## Huawei endpoints

- WAN: `/html/bbsp/common/getWanDynamicData.asp` via the existing `parseWan` parser.
- Wi-Fi: `/html/amp/wlanadv/wlanadvance_api.asp` via the existing `parseWifi` parser.
- Connected-client counts: `/html/bbsp/common/GetLanUserDevInfo.asp` via the existing device parser.
- Other modules: no verified captured endpoint; responses say `Not supported by current firmware`.

## Database schema

- `network_history`: timestamped module state and primary observed value.
- `traffic_history`: real Rx/Tx counters only when firmware supplies them.
- `dhcp_history`: reserved for verified DHCP observations.
- `interface_history`: reserved for verified interface counters.

No historical point is generated when its underlying value is null.

## Module diagram

WAN, LAN, Wi-Fi, Guest Wi-Fi, DHCP, DNS, NAT, forwarding, and interfaces are separate service modules under `backend/src/network`. Unsupported modules use a common safe response contract. The frontend module page provides live WebSocket refresh, search, responsive tables, CSV/JSON export, and disabled actions with the firmware reason.

## Validation and changes

All network writes return HTTP 501. When a verified write endpoint is added later it must validate IP/CIDR/port/hostname/MAC/DNS/MTU values, show current and new values, name the affected service, require confirmation, and warn about rollback risk.
