# Diagnostics Security

Targets reject whitespace, shell metacharacters, leading options, newlines, invalid hostnames, invalid ports, credentials in URLs, and non-HTTP schemes. HTTP resolves targets before connection and blocks loopback, unspecified, link-local, multicast, and known metadata addresses. TCP checks exactly one host and port. Processes use `execFile` argument arrays, bounded duration/output, and hidden windows. Stored/exported results exclude credentials, cookies, tokens, authorization headers, session IDs, and raw Huawei responses.
