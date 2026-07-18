# Huawei OptiXstar LG8245X6-10 live API notes

## Authentication sequence

1. Open the router base URL and allow the initial page to load.
2. Request the token page at `/html/GetRandToken.asp`.
3. Submit the login form to `/html/login.asp` with `username`, `password`, `frmLogin=Login` and the retrieved token.
4. Retain the session cookies and optionally a CSRF-style token from the login response.
5. If the session expires, repeat the login flow before issuing read requests again.

## Required cookies / tokens

- Session cookie such as `JSESSIONID` or equivalent router session cookie.
- Optional CSRF token header derived from the returned HTML and reused for subsequent requests.
- No credentials are stored in the repository; they are read from environment variables only.

## Read endpoints

The backend is prepared to request the following router endpoints when supported by the live firmware:

- `deviceinfo.asp`
- `GetLanUserDevInfo.asp`
- `getuserdevinfo.asp`
- `getHomeNetdata.asp`
- `getWanDynamicData.asp`
- `wanStateMonitor.asp`
- `WlanBasic.asp`
- `WlanAdvance.asp`
- `refreshTime.asp`

## Response handling

- Response bodies are parsed conservatively.
- Values are surfaced as `null` or `supported: false` when not present or not supported.
- The implementation avoids inventing values and uses the router response only.

## Unsupported or uncertain operations

- Some firmware builds do not expose all endpoints or return non-JSON payloads.
- The backend reports `supported: false` or `null` for unavailable values instead of fabricating placeholders.
