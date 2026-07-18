# Diagnostics Suite

The suite separates validated diagnostic adapters, orchestration, persistence, APIs, WebSocket events, and UI. Active tests use backend OS facilities through argument arrays, never a shell string. Global concurrency is two runs and rate is ten starts per minute. Output is capped at 64 KiB; ping count, packet size, hop count, and timeouts are bounded.

Supported backend measurements are ping, traceroute, DNS/PTR, single-target TCP, and HTTP HEAD. Router-native ping and MTU discovery remain unsupported because no Huawei endpoint or OS behavior has been verified. Guided router/WAN/LAN/Wi-Fi/device/DHCP/route/ARP flows use the existing real snapshot and never change configuration.
