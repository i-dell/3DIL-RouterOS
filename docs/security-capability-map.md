# Security Capability Map

| Capability | Read | Write | Evidence |
|---|---:|---:|---|
| Management authentication | Verified | Not exposed | Protected page verification |
| Firmware information | Verified when present | Not exposed | Device information parser |
| Firewall status | Conditional | Unverified | Security parser value required |
| Firewall rules | Unverified | Unverified | No verified parser or mutation |
| MAC filtering | Unverified | Unverified | No verified parser or mutation |
| Access control / device blocking | Unverified | Unverified | No verified mutation |
| Parental control | Unsupported | Unsupported | Not exposed by current capture |
| Content filtering | Unsupported | Unsupported | Not exposed by current capture |
| DNS servers | Conditional | Unverified | WAN parser |
| Wi-Fi security | Conditional | Unverified | Wi-Fi parser; encryption must be present |
| Hardening details | Partial | Unverified | Firmware version only |

Read and write support are deliberately independent. A visible value never implies that changing it is safe.
