Goal: Implement LDAP-priority login with local fallback, with authProvider marking and no password resets for LDAP accounts; keep avatar/tag defaults unchanged.

Plan:
1) Config: Add LDAP config to packages/config/server.ts (LDAP_ENABLE, LDAP_URL, bindDN, bindCredentials, searchBase, searchFilter, tlsOptions). Update .env docs/README.
2) Model: Extend User schema with read-only authProvider (default 'local'); LDAP-created users set authProvider='ldap' and do not store password hash.
3) LDAP helper: Add server-side helper (bind/search/verify) for LDAP; dependency in packages/server/package.json; design for easy mocking.
4) Login route: In packages/server/src/routes/user.ts, attempt LDAP first when enabled; on success ensure local user (create if missing, mark authProvider=ldap, reuse default avatar/tag logic), issue JWT; if LDAP fails or disabled, fall back to existing bcrypt login. Prevent LDAP users from local password reset.
5) Client: Optionally allow authType='ldap' parameter; default remains local; no UI change required.
6) Tests & docs: Add login route tests covering LDAP on/off, success/fallback, authProvider marking, reset restriction; update config/docs with usage notes.

Decisions:
- authProvider is read-only; LDAP accounts cannot use local password reset.
- Default avatar/tag handling stays identical for LDAP-created users.
