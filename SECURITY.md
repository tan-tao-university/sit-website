# Security Policy

## Reporting a vulnerability

If you believe you've found a security vulnerability in this project (the public site, dashboard, or backend API), please report it privately rather than opening a public issue or pull request.

- Preferred: open a [private security advisory](../../security/advisories/new) on GitHub for this repository.
- Alternative: email **sit@ttu.edu.vn** with a description of the issue, steps to reproduce, and its potential impact.

Please include:

- The affected component (public site, dashboard, or backend API) and, if known, the file or endpoint.
- Steps to reproduce, or a proof of concept.
- The impact you'd expect (e.g. data exposure, privilege escalation, authentication bypass).

## What to expect

- Acknowledgement within **5 business days**.
- We'll investigate, confirm severity, and work on a fix. We'll keep you updated as the fix progresses.
- Please give us a reasonable amount of time to release a fix before disclosing the issue publicly.

## Scope

In scope: the code in this repository (`app/`, `dashboard/`, `backend/`) and its deployment configuration (`deploy.sh`, `.github/workflows/`).

Out of scope: third-party services and dependencies themselves (report those upstream), and social engineering or physical attacks against university staff or infrastructure.

## Supported versions

This project is deployed continuously from the `main`/`prod` branch — there are no maintained older versions. Security fixes land on `main` and are deployed as part of the normal release process.
