# Huawei OptiXstar LG8245X6-10 live API notes

## Authentication sequence

1. Open the router base URL and allow the initial page to load.
2. Request `/asp/GetRandCount.asp` to initialize the challenge flow.
3. Request the token page at `/html/ssmp/common/GetRandToken.asp`.
4. Submit the login form to `/login.cgi` with `UserName`, `PassWord`, `Language=english` and `x.X_HW_Token` when available.
5. Retain the session cookies and optional CSRF-style token from the login response.
6. If the session expires, repeat the login flow before issuing read requests again.

## Required cookies / tokens

- Session cookie such as `JSESSIONID` or equivalent router session cookie.
- Optional CSRF token header derived from the returned HTML and reused for subsequent requests.
- No credentials are stored in the repository; they are read from environment variables only.

## Read endpoints

The backend is prepared to request the following router endpoints when supported by the live firmware:

- `/html/bbsp/common/deviceinfo.asp`
- `/html/bbsp/common/GetLanUserDevInfo.asp`
- `/html/bbsp/common/getWanDynamicData.asp`
- `/html/bbsp/common/wanStateMonitor.asp`
- `/html/bbsp/common/WlanBasic.asp`

## Response handling

- Response bodies are parsed conservatively.
- Values are surfaced as `null` or `supported: false` when not present or not supported.
- The implementation avoids inventing values and uses the router response only.

## Local backend contract

The frontend consumes router data only through the local backend:

- `POST /api/v1/router/auth`
- `POST /api/v1/router/logout`
- `GET /api/v1/router/connection`
- `GET /api/v1/router/device-info`
- `GET /api/v1/router/health`
- `GET /api/v1/router/wan`
- `GET /api/v1/router/wifi`
- `GET /api/v1/router/devices`
- `GET /api/v1/router/snapshot`

## Unsupported or uncertain operations

- Some firmware builds do not expose all endpoints or return non-JSON payloads.
- The backend reports `supported: false` or `null` for unavailable values instead of fabricating placeholders.
