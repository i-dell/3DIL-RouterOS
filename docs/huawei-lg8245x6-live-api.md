# Huawei LG8245X6-10 live API — V500R022C10SPC272

Derived from the two local HAR captures. Captures, cookies, credentials, tokens, and response bodies are excluded from git.

## Authentication

1. `GET /` obtains initial cookies.
2. `POST /asp/GetRandCount.asp`, Referer `/`, obtains the challenge/token response.
3. `POST /login.cgi`, `application/x-www-form-urlencoded`, Referer `/`, fields `UserName`, `PassWord`, `Language`, `x.X_HW_Token`.
4. `GET /index.asp` verifies the session. HTTP 200 from `login.cgi` is not a success marker: captured login responses are empty. Success requires protected frame/menu content and absence of `login.cgi`, `UserName`, and `safelogin.js` login-page markers. A returned login page means rejected credentials; an unknown protected response means protocol mismatch.

Cookies are required for all protected requests. Multiple `Set-Cookie` headers are preserved without splitting an `Expires` date at its comma.

## Read endpoints

| Endpoint | Method | Referer | Body/token | Format/parser |
|---|---|---|---|---|
| `/html/ssmp/deviceinfo/deviceinfo.asp` | GET | `/index.asp` | none | HTML/JS, `stDeviceInfo(domain, SerialNumber, HardwareVersion, SoftwareVersion, ModelName, ...)` |
| `/html/bbsp/common/GetLanUserDevInfo.asp` | GET | `/CustomApp/mainpage.asp` | none | JS arrays, `USERDevice`/`USERDeviceNew` positional constructors |
| `/html/bbsp/userdevinfo/getuserdevinfo.asp` | POST | `/html/bbsp/userdevinfo/userdevinfo1.asp` | captured empty body | JS constructor response; supported parser infrastructure, not polled because the common endpoint provides the list |
| `/html/bbsp/userdevinfo/getHomeNetdata.asp` | POST | `/html/bbsp/userdevinfo/userdevinfosmart.asp` | `x.X_HW_Token` | `stHomeNetName` array; not polled because token lifecycle for this response was not independently verified |
| `/html/bbsp/common/getWanDynamicData.asp` | GET | `/index.asp` | none | HTML/JS WAN constructors/declarations |
| `/html/bbsp/common/wanStateMonitor.asp` | GET and POST observed | `/index.asp` | empty | short status text; not used as the primary WAN source |
| `/html/amp/wlanbasic/WlanBasic.asp` | GET | `/index.asp` | none | HTML/JS page |
| `/html/amp/wlanadv/WlanAdvance.asp` | GET | `/index.asp` | none | HTML/JS page |
| `/html/amp/wlanadv/wlanadvance_api.asp` | GET | `/html/amp/wlanadv/WlanAdvance.asp` | none | `stWlan`/`stWlanWifi` arrays; live Wi-Fi parser |

The parser is a controlled quoted-argument tokenizer for known constructor names. It does not use `eval` and does not execute router JavaScript.

## Capabilities

Device identity, WAN, Wi-Fi and connected devices are reported only when mapped values occur. CPU, memory, temperature, traffic rates, device RSSI, firewall, MAC-filter, DMZ and UPnP status remain unsupported unless a captured response exposes a verified mapping. Configuration writes are unsupported in v2.0.0.

## Local verification

Run the backend inside the router LAN, set `ROUTER_USERNAME` and `ROUTER_PASSWORD` only in process memory/environment, then run `npm run test:live`. The capture establishes the protocol, but current live reachability and credentials must be verified on the target LAN.
