# Security

## Reporting a vulnerability

If you discover a security issue in Cosmos Explorer, please open an issue on the
GitHub repository describing the problem, or contact the maintainer directly.
Please do not include exploit details in a public issue for anything that could
affect users until it has been addressed.

## Security measures

This project applies the following protections:

**API key handling.** Third-party API keys (NASA) are never exposed to the
client. All keyed requests are proxied through serverless functions that read
the key from server-side environment variables. No secret is committed to the
repository.

**Input validation.** User-supplied identifiers passed to upstream catalog
queries are strictly validated against allowlist patterns before use. The
SIMBAD proxy validates object identifiers against a restricted character set to
prevent ADQL query injection; the asteroid-detail proxy accepts only numeric
IDs. The ML prediction endpoint validates all inputs against physical range
bounds and rejects unexpected fields.

**CORS.** Serverless proxies and the ML service restrict cross-origin access to
the application's own origins rather than allowing all origins.

**Rate limiting.** The serverless API proxies enforce a shared per-IP rate limit
backed by Upstash Redis (required because serverless instances are ephemeral and
cannot share in-process state). The ML prediction service enforces a tighter
per-IP limit using an in-process limiter, which is appropriate for a single
persistent instance and avoids an unnecessary network dependency in the request
path.

**Security headers.** Responses set `Content-Security-Policy`,
`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and
`Permissions-Policy` to limit clickjacking, MIME sniffing, and referrer leakage.

**Error hygiene.** Proxy and service errors return generic messages to clients
rather than forwarding upstream error details, stack traces, or internal URLs.

## Dependency audit

Dependencies are audited with `pnpm audit`. As of the last review, all advisories
present are confined to development and build tooling (`@vercel/node` local
emulation and the `vitest`/`jsdom` test stack) — none are reachable in the
deployed application's request runtime. Production runtime dependencies are clean.
These transitive dev-tooling advisories are pinned by their parent packages and
resolve as those parents update; they are tracked but accepted as non-reachable.

Install-time scripts are disabled by default (`enable-pre-post-scripts=false`)
and approved explicitly per package, reducing supply-chain exposure.