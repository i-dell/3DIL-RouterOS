# Metrics Catalog

| Metric | Classification | Source |
|---|---|---|
| Reachability, authentication | measured | Authenticated polling |
| Uptime, WAN state, public IP | measured when present | Huawei parsers |
| WAN RX/TX bytes | measured when present | Huawei WAN counters |
| WAN download/upload rate | derived | Consecutive counter delta |
| Connected-device count | measured | Huawei device parser |
| Wi-Fi radios/channel | measured when present | Huawei Wi-Fi parser |
| Interface/device traffic | unsupported | No verified counters |
| CPU, memory, temperature | unsupported unless returned | Huawei snapshot |
