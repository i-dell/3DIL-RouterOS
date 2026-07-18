# Adil RouterOS v4 UI verification

| Area | Result | Evidence |
|---|---|---|
| Desktop 1920×1080, 1440×900, 1280×800 | Passed | multi-column dashboard, fixed RTL sidebar, no horizontal overflow |
| Tablet 1024×768, 768×1024 | Passed | responsive card grids and drawer navigation |
| Mobile 430×932, 390×844 | Passed | single-column content, fixed safe-area bottom navigation, no overlap |
| Sidebar collapse/expand | Passed | visible keyboard-accessible control; active state retained; preference stored locally |
| Mobile drawer | Passed | right-side drawer, overlay, Escape close and body scroll lock |
| Route verification | Passed | dashboard, devices, Wi-Fi, advanced, security, parental control, QoS, reboot, diagnostics, logs, backup, setup and device information routes render |
| Real-data verification | Passed | model, firmware, hardware, serial, WAN, LAN, SSIDs and devices originate in normalized live snapshot APIs |
| Unsupported values | Passed | CPU, memory, temperature, rates, ISP and other absent fields use compact unavailable states |
| Console/runtime | Passed | no new browser console or page-level errors during route and breakpoint checks |

No sample values, example devices, passwords or generated chart series from the visual reference are present.
