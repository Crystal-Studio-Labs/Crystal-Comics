# 🛡️ Security Policy & Vulnerability Disclosure

> **Platform**: Crystal Comics (`crystal-scans`)

---

## 🔒 Security Architecture Overview

Crystal Comics prioritizes end-user data privacy, zero credential leaks, and production-grade security standards:

1. **Environment Secret Protection**:
   - Sensitive service tokens (e.g. `DISCORD_BOT_TOKEN`, `CLOUDFLARE_R2_SECRET_ACCESS_KEY`, `DISCORD_CLIENT_SECRET`) are strictly restricted to Node.js backend servers (`server/`) and serverless Edge Functions.
   - Frontend React bundles only receive public anon keys (`VITE_SUPABASE_ANON_KEY`) and public CDN endpoints.

2. **Supabase Row Level Security (RLS)**:
   - All PostgreSQL database tables in [`supabase/schema.sql`](file:///D:/Projects/Crystal-Comics/supabase/schema.sql) enforce strict RLS security policies.
   - Public users are granted `SELECT` (read-only) access to manga, chapters, and comments.
   - Mutations (`INSERT`, `UPDATE`, `DELETE`) require authenticated user JWT verification (`auth.uid() = user_id`).

3. **Cloudflare R2 Presigned S3 Upload Security**:
   - Chapter uploads require short-lived presigned S3 URLs generated exclusively by the authenticated backend API.

---

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability within Crystal Comics, please follow our responsible disclosure process:

1. **Do NOT report security vulnerabilities via public GitHub issues.**
2. Email your findings directly to the maintainers at **`security@crystalcomics.com`** (or contact team leadership privately on Discord).
3. Include:
   - Type of vulnerability (e.g., Auth bypass, RLS policy leak, SSRF, XSS).
   - Step-by-step reproduction steps or proof-of-concept payload.
   - Potential impact of the vulnerability.

---

## ⏱️ Response & Disclosure SLA

- **Initial Response**: Within 24–48 hours of report submission.
- **Triage & Patch Fix**: Within 7 business days for high/critical severity issues.
- **Public Disclosure**: Coordinated after a security fix has been deployed to production.
