# Adil RouterOS v4 live verification

| Feature | Result | Evidence endpoint | Safe result |
|---|---|---|---|
| Backend health | Passed | `/health` | v2.0.0, running |
| Huawei authentication | Passed | `/api/v1/router/diagnostics` | verified, HTTP 200 |
| Protected router page | Passed | `/index.asp` through driver | authenticated marker verified |
| Snapshot freshness | Passed | `/api/v1/router/snapshot` | current timestamp, not synthetic |
| Device identity | Passed | `deviceinfo.asp` | real model and firmware |
| Connected devices | Passed | `GetLanUserDevInfo.asp` | real IP/MAC records returned |
| Wi-Fi | Passed | `wlanadvance_api.asp` | real SSIDs returned |
| WAN | Passed | `getWanDynamicData.asp` | parser returns only exposed values |
| Capability registry | Passed | `/api/v1/router/capabilities` | source, parser and support state reported |
| Navigation routes | Passed | localhost route audit | all implemented routes render headings |
| Sidebar collapse/expand | Passed | browser UI | state changes without reload and persists locally |
| Unsupported writes | Passed | router write APIs | HTTP 501; no fake success |
| Disruptive writes | Requires human test | router UI + new HAR | not executed automatically |
| Secrets in API/log UI | Passed | sanitized API inspection | no credentials, cookies, tokens or raw bodies |

The live suite is non-destructive. Reboot, reset, WAN, Wi-Fi password, DMZ and firewall changes were not executed.
