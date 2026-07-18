# Security Center Verification

## Safety acceptance

- PASS — Huawei authentication and HAR parsers are unchanged.
- PASS — Read and write capabilities are represented independently.
- PASS — No unverified security mutation endpoint exists.
- PASS — Unknown values render as unknown or unsupported rather than guessed values.
- PASS — Threat, incident, alert, event, and firewall-rule collections are empty when the router provides none.
- PASS — The score denominator contains only verified controls.
- PASS — The score UI states that its result is partial and displays confidence and evidence counts.
- PASS — Recommendations are deterministic and never claim automatic remediation.
- PASS — Security score observations persist in SQLite.
- PASS — Recursive redaction covers password, credential, authorization, cookie, token, session, and secret keys.
- PASS — WebSocket score updates originate from real router snapshots.
- PASS — Unsupported buttons are disabled and explain that firmware support is unverified.

## Firmware-dependent verification

- PASS when evidence is present — management authentication, firmware visibility, WAN DNS, Wi-Fi radios.
- PASS when explicit booleans are present — firewall, MAC filter, DMZ, and UPnP state.
- NOT EXPOSED — firewall rules, device blocking, parental controls, content filters, remote-management protocols, WPS, and configuration writes.

“NOT EXPOSED” is a safe capability result, not a test failure and not evidence that the router lacks the underlying feature.
