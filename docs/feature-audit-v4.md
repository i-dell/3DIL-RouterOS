# Adil RouterOS v4 feature audit

Generated from the repository and the two private Huawei HAR captures. “Requires HAR” means no request with post-action verification was proven; it is not a claim that the router lacks the feature.

| Feature / page | Status | Backend API | Huawei endpoint / parser | Real data | Write | Verification / required work |
|---|---|---|---|---|---|---|
| Overview, Dashboard, Network Status | live-working | `/api/v1/router/snapshot` | normalized snapshot | Yes | Refresh only | Live snapshot and diagnostics |
| Connected Devices | live-read-only | `/api/v1/router/devices` | `GetLanUserDevInfo.asp` / `parseDevices` | Yes | Local CSV only | Protected HTTP 200 and real records |
| Wi-Fi Settings | live-read-only | `/api/v1/router/wifi` | `wlanadvance_api.asp` / `parseWifi` | Yes | Requires HAR verification | SSIDs verified live; do not expose passwords |
| WAN / Internet | live-read-only | `/api/v1/router/wan` | `getWanDynamicData.asp` / `parseWan` | Yes | No | Live parser; never label as public IP |
| Router/System/Firmware/About Device | live-read-only | `/api/v1/router/device-info` | `deviceinfo.asp` / `parseDeviceInfo` | Yes | No | Model and firmware verified live |
| Guest Wi-Fi, LAN, DHCP, reservations, DNS, IPv6, NAT, DDNS, routes, QoS | requires-new-HAR-capture | capability registry | HAR pages exist but normalized parsers are absent | No normalized value | Disabled | Capture read and safe post-write state where applicable |
| Port Forwarding, DMZ, UPnP, Firewall, MAC filtering, blacklist, whitelist | requires-new-HAR-capture | structured HTTP 501 | HAR management pages exist | No normalized value | Disabled | Capture exact request plus post-action verification |
| Parental control, content/URL/domain/DNS filtering, browsing monitor, application control, schedules | unsupported-by-firmware | capability registry | No proven data endpoint | No | Disabled | Additional firmware evidence required; never infer browsing history |
| Security Center | live-read-only | `/api/v1/router/security` | no verified parser values | Capability only | Disabled | Compact unsupported states, no fabricated score |
| Live Monitoring, traffic, bandwidth, device traffic, Wi-Fi analytics, WAN history, topology | visual-only where metric absent | WebSocket + snapshot | shared polling | Snapshot events only | No | Add charts only when real time-series values exist |
| Event timeline, notifications, security events, alerts, system logs | local-agent-working | `/api/v1/logs` | sanitized polling events | Yes | CSV export | No credentials, cookies, tokens, or bodies |
| Network diagnostics, Internet health, local-agent diagnostics | local-agent-working / partial | diagnostics API | local agent + router diagnostics | Yes | Safe refresh | Ping/traceroute/DNS/port tools still require validated implementations |
| Reboot, backup, restore, factory reset, firmware update | high-risk-not-live-tested | structured HTTP 501 | HAR pages do not prove safe workflow | No | Disabled | Human-approved capture and verification required |
| Appearance, language, sidebar state, application settings | local-metadata-working / partial | browser-local preference | local application | Yes | Sidebar works | Never store router password in browser storage |

All visible unsupported operations must remain disabled with `Not supported by firmware` or capture guidance. Authentication, Base64 transformation, cookies, headers, protected verification and parsers are unchanged.
