# Security policy

## Scope

dash-ds is an internal Dash design system (CLI, registry, docs, MCP server). Vulnerabilities in any of these components are in scope.

Out of scope:
- Issues that require admin/maintainer privileges to exploit.
- Vulnerabilities in upstream dependencies — report those to the relevant project (open a heads-up issue here only if dash-ds usage materially worsens the impact).
- Findings that depend on social engineering of the maintainer.

## Reporting a vulnerability

**Do not open a public GitHub issue for security problems.**

Two private channels:

1. **GitHub Security Advisories** (preferred) — open a private advisory at
   <https://github.com/irfanprimaputra/dash-ds/security/advisories/new>.
2. **Email** — `irfanprima34@gmail.com` with subject prefix `[dash-ds security]`.

Include:
- A description of the vulnerability and its impact.
- Steps to reproduce or a proof-of-concept.
- Affected version (`dash --version`, commit SHA, or package version).
- Your suggested fix, if any.

## Response timeline

| Stage | Target |
|---|---|
| Acknowledge receipt | 72 hours |
| Initial assessment | 7 days |
| Fix or mitigation plan | 30 days for high/critical, 90 days for medium/low |
| Public disclosure | After fix shipped, coordinated with reporter |

## Disclosure

We follow coordinated disclosure. Once a fix is available we will:
- Credit the reporter in the release notes (unless anonymity is requested).
- Publish a GitHub Security Advisory with CVE if applicable.
- Push the fix to `main` and tag a patch release.

## Supported versions

Only the latest minor on `main` is supported. There are no LTS branches.

| Version | Supported |
|---|---|
| Latest `main` | Yes |
| Older tags | No — please upgrade |
