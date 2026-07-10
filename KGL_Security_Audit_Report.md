# KGL Inventory Tracking System
## Application Security Assessment Report

**Legacy Codebase Security Audit — Pre-Modernization Review**

| | |
|---|---|
| **Assessment Date** | 09 July 2026 |
| **Target** | Node.js / Express / MongoDB inventory & wholesale management application |
| **Codebase Origin** | 2022 (legacy, pre-modernization) |
| **Methodology** | Manual static source code review (SAST-style manual audit) |
| **Findings** | 15 issues across authentication, authorization, input handling, session management, and data protection |

---

## Executive Summary

This report documents a manual application security review of the KGL inventory and wholesale sales tracking system, a Node.js/Express/MongoDB application originally built in 2022. The review was conducted as the audit phase of a planned modernization effort, ahead of a full rebuild incorporating secure-by-design principles, containerization, and a DevSecOps pipeline.

Fifteen findings were identified: **3 Critical**, **6 High**, **4 Medium**, and **2 Low** severity. The most significant issue is a complete absence of role-based authorization: the application authenticates users but does not verify their role before granting access to role-restricted routes. This is compounded by an unrestricted mass-assignment vulnerability in user creation, which together form a confirmed privilege-escalation chain — any authenticated user can provision themselves an administrative-level account. A hardcoded, trivially guessable session secret and the absence of CSRF protection further widen the attack surface.

Positive findings are also noted: password storage uses bcrypt with an appropriate cost factor, hashing is correctly scoped to a Mongoose pre-save hook, and confirmation fields are correctly stripped before persistence. These patterns should be preserved in the rebuild.

**Recommendation:** given the scope and foundational nature of the authorization findings, a redesign of the access-control and input-validation layers is recommended over an incremental patch of the existing routing structure.

### Severity Summary

| Severity | Count | Definition |
|---|:---:|---|
| 🔴 **CRITICAL** | 3 | Directly exploitable; leads to full account compromise, privilege escalation, or authentication bypass. |
| 🟠 **HIGH** | 6 | Significant data exposure or integrity risk; exploitable under common conditions. |
| 🟡 **MEDIUM** | 4 | Meaningful weakness that increases risk or aids a broader attack chain. |
| ⚪ **LOW** | 2 | Best-practice deviation with limited standalone impact. |

---

## Scope & Methodology

This assessment consisted of a manual, whitebox static review of the application's source code, covering the application entry point, routing layer, controllers, authentication configuration, and Mongoose data models. No dynamic testing (live request fuzzing, DAST scanning, or penetration testing against a running instance) was performed as part of this review; findings involving exploitability under runtime conditions are noted as such.

**Files reviewed:**
- `app.js` — application bootstrap, middleware, and route mounting
- `config/auth.js` — authentication middleware
- `config/passport.js` — Passport local strategy configuration
- `routes/homeroutes.js`, `managerroutes.js`, `directorroutes.js`, `agentroutes.js`
- `controllers/userController.js`, `salesController.js`, `produceController.js`, `credsalesController.js`
- `models/User.js`, `Sale.js`, `Produce.js`, `CreditSale.js`
- `package.json` — dependency manifest

---

## Findings Index

| ID | Severity | Finding | Location |
|---|---|---|---|
| VULN-01 | 🔴 CRITICAL | Broken Access Control — No Role-Based Authorization | `app.js` |
| VULN-02 | 🔴 CRITICAL | Mass Assignment Leading to Privilege Escalation | `userController.js` |
| VULN-03 | 🔴 CRITICAL | Hardcoded, Weak Session Secret | `app.js` |
| VULN-04 | 🟠 HIGH | Insecure Direct Object References (IDOR) Across All Resources | `userController.js`, etc. |
| VULN-05 | 🟠 HIGH | Unrestricted Mass Assignment on Update Operations | `salesController.js`, etc. |
| VULN-06 | 🟠 HIGH | Session Contains Sensitive User Document, Including Password Hash | `passport.js`, `homeroutes.js` |
| VULN-07 | 🟠 HIGH | Unsanitized Input Reaches MongoDB Queries (NoSQL Injection Surface) | `app.js`, `passport.js` |
| VULN-08 | 🟠 HIGH | Sensitive PII (National ID Number) Stored and Exposed Without Protection | `models/CreditSale.js` |
| VULN-09 | 🟠 HIGH | Absence of CSRF Protection | Application-wide |
| VULN-10 | 🟡 MEDIUM | User Enumeration via Distinct Login Error Messages | `passport.js` |
| VULN-11 | 🟡 MEDIUM | No Rate Limiting on Authentication Endpoint | `homeroutes.js` |
| VULN-12 | 🟡 MEDIUM | Session Cookie Missing Explicit Security Flags | `app.js` |
| VULN-13 | 🟡 MEDIUM | Unhandled Promise Rejections in Route Handlers | `directorroutes.js` |
| VULN-14 | ⚪ LOW | Missing Security Hardening Middleware and Outdated Dependency Alignment | `package.json` |
| VULN-15 | ⚪ LOW | Implicit Global Variable Declaration | `managerroutes.js`, `directorroutes.js` |

---

## Detailed Findings

Findings are ordered by severity, then by discovery order. Each includes the affected location, representative code evidence, business impact, and remediation guidance.

---

### VULN-01 — Broken Access Control — No Role-Based Authorization

| | |
|---|---|
| **Severity** | 🔴 CRITICAL |
| **CWE** | CWE-862: Missing Authorization |
| **Location** | `app.js`, `config/auth.js` |

**Description**
Route protection is limited to session-authentication checks. The `ensureAuthenticated` middleware confirms that a user is logged in, but no middleware verifies that the logged-in user holds the role required for the route being accessed. All three role-specific route groups (`/manager`, `/director`, `/agent`) are mounted behind the same undifferentiated check.

**Evidence**
```js
// app.js
app.use('/manager', ensureAuthenticated, managerRoutes);
app.use('/director', ensureAuthenticated, directorRoutes);
app.use('/agent', ensureAuthenticated, agentRoutes);

// config/auth.js
ensureAuthenticated: function (req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  ...
}
```

**Impact**
Any authenticated user, regardless of assigned role, can directly navigate to higher-privilege routes. An Agent account can reach Director-only aggregate financial views and Manager-only user administration endpoints simply by requesting the URL.

**Remediation**
Introduce a `requireRole(...roles)` middleware that inspects the authenticated user's role and returns 403 Forbidden if it is not in the allowed list. Apply it per route group, and re-verify role membership server-side on every request — never trust client-side navigation or link visibility as an access control mechanism.

---

### VULN-02 — Mass Assignment Leading to Privilege Escalation

| | |
|---|---|
| **Severity** | 🔴 CRITICAL |
| **CWE** | CWE-915: Improperly Controlled Modification of Dynamically-Determined Object Attributes |
| **Location** | `controllers/userController.js` — `createUser` |

**Description**
The `role` field for a new user is taken directly from the request body with no allowlist, server-side default, or authorization check on which roles the requesting user is permitted to assign.

**Evidence**
```js
const { firstname, lastname, role, email, telno, branch,
        password, passconf } = req.body;
...
const newUser = new User({ firstname, lastname, role, email,
                            telno, branch, password, passconf });
```

**Impact**
Chained with VULN-01, this is a full account-takeover / privilege-escalation path requiring no special access: an authenticated Agent can submit a POST to `/manager/users/new` with `role="Director"` and mint themselves (or any party) a Director-level account in a single request.

**Remediation**
Never bind `role` from client input on self-service or peer-created accounts. Determine the assignable role set from the acting user's own privilege level server-side, or require a separate, explicitly authorized administrative action to change roles. Apply the same allowlist discipline to every model field accepted from `req.body`.

---

### VULN-03 — Hardcoded, Weak Session Secret

| | |
|---|---|
| **Severity** | 🔴 CRITICAL |
| **CWE** | CWE-798: Use of Hard-coded Credentials |
| **Location** | `app.js` |

**Description**
The Express session middleware is configured with a static, trivially guessable secret string committed directly in source.

**Evidence**
```js
const expressSession = require('express-session')({
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
});
```

**Impact**
Session cookies are signed with a well-known value. Anyone aware of (or who guesses) this secret can forge valid session cookies, impersonating any user without knowing their password.

**Remediation**
Load the session secret from an environment variable / secrets manager, generate it as a long, cryptographically random value, and rotate it. Never commit secrets to source control; add a pre-commit secrets-scanning hook to catch this class of issue going forward.

---

### VULN-04 — Insecure Direct Object References (IDOR) Across All Resources

| | |
|---|---|
| **Severity** | 🟠 HIGH |
| **CWE** | CWE-639: Authorization Bypass Through User-Controlled Key |
| **Location** | `userController.js`, `salesController.js`, `produceController.js`, `credsalesController.js` |

**Description**
The `getUser`, `getSale`, `getProduce`, and `getCreditSale` handlers (and their update/delete counterparts) fetch records purely by the `:id` route parameter, with no check that the requesting user owns, manages, or otherwise has a legitimate claim to that specific record. This is in contrast to the list views (e.g. `getAllSales`), which do filter by branch or agent name.

**Evidence**
```js
exports.getUser = async (req, res) => {
  const usr = await User.findById(req.params.id);
  // no ownership / branch / role check
  res.render('edituser', { usr, ... });
};
```

**Impact**
An authenticated user can enumerate sequential or guessed MongoDB ObjectIDs to read, modify, or delete records belonging to other branches or agents — including buyer contact details, national ID numbers, and financial records — entirely outside their assigned scope.

**Remediation**
Scope every findById-style query with an additional filter matching the requesting user's branch/ownership (e.g. `User.findOne({ _id, branch: req.user.branch })` for non-Director roles), and return 403/404 rather than the record when the filter does not match.

---

### VULN-05 — Unrestricted Mass Assignment on Update Operations

| | |
|---|---|
| **Severity** | 🟠 HIGH |
| **CWE** | CWE-915: Improperly Controlled Modification of Dynamically-Determined Object Attributes |
| **Location** | `salesController.js`, `produceController.js`, `credsalesController.js` |

**Description**
Update handlers pass the entire request body directly into `findByIdAndUpdate` with no field allowlist.

**Evidence**
```js
await Sale.findByIdAndUpdate(req.params.id, req.body, {
  new: true,
  runValidators: true,
});
```

**Impact**
Any field defined in the Mongoose schema can be overwritten by whoever can reach the route — including branch assignment (`brname`) and financial fields (`amtpaid`, `amtdue`, `buyprice`, `price`), enabling record tampering and falsification of sales or payment data.

**Remediation**
Explicitly destructure and allowlist only the fields a given role is permitted to update; reject or ignore any unexpected keys. Consider a schema-validation layer (Joi/Zod) applied before the field set ever reaches Mongoose.

---

### VULN-06 — Session Contains Sensitive User Document, Including Password Hash

| | |
|---|---|
| **Severity** | 🟠 HIGH |
| **CWE** | CWE-522: Insufficiently Protected Credentials |
| **Location** | `config/passport.js`, `routes/homeroutes.js` |

**Description**
The Passport local strategy looks up the user with `.select('+password')` to perform the bcrypt comparison, then passes that same document to `done(null, user)`. On successful login, `homeroutes.js` copies the entire `req.user` object into the session store.

**Evidence**
```js
// passport.js
User.findOne({ email }).select('+password').then((user) => {
  ...
  return done(null, user); // full doc, incl. password hash
});

// homeroutes.js
req.session.user = req.user;
```

**Impact**
The bcrypt password hash is persisted into the session store (in-memory by default in this configuration) for the lifetime of every session, unnecessarily widening the blast radius of any session-store compromise.

**Remediation**
Only ever store a minimal identifier (user ID + role) in the session, or rely on Passport's existing `serializeUser`/`deserializeUser` mechanism instead of a parallel `req.session.user` copy. Strip sensitive fields before anything touches session storage.

---

### VULN-07 — Unsanitized Input Reaches MongoDB Queries (NoSQL Injection Surface)

| | |
|---|---|
| **Severity** | 🟠 HIGH |
| **CWE** | CWE-943: Improper Neutralization of Special Elements in Data Query Logic |
| **Location** | `app.js`, `config/passport.js`, all controllers |

**Description**
`express.urlencoded({ extended: true })` uses the `qs` parser, which converts bracket-notation form fields (e.g. `email[$ne]=`) into nested objects rather than strings. Several queries — most notably the login lookup — pass user-supplied fields directly into Mongoose query filters without type enforcement.

**Evidence**
```js
app.use(express.urlencoded({ extended: true }));

// passport.js
User.findOne({ email }).select('+password')...
```

**Impact**
If `email` is submitted as a query operator object instead of a string, query semantics can be altered — the classic Express/Mongoose NoSQL injection pattern. Exploitability against this specific schema was not confirmed by live testing during this review and should be validated with a dedicated test pass.

**Remediation**
Set `express.urlencoded({ extended: false })` unless nested objects are genuinely required, add `express-mongo-sanitize` (or equivalent) as global middleware, and enforce a string type check on `email`/`password` before they reach any Mongoose query.

---

### VULN-08 — Sensitive PII (National ID Number) Stored and Exposed Without Additional Protection

| | |
|---|---|
| **Severity** | 🟠 HIGH |
| **CWE** | CWE-359: Exposure of Private Personal Information |
| **Location** | `models/CreditSale.js` |

**Description**
The `CreditSale` schema stores a buyer's National Identification Number (`nin`) as a plain, unencrypted string field, retrievable by any authenticated user who can reach the record (see VULN-04).

**Evidence**
```js
nin: {
  type: String,
  trim: true,
  required: [true, 'A NIN is required'],
},
```

**Impact**
Government ID numbers are high-sensitivity PII in most jurisdictions. Combined with the IDOR finding, any authenticated user — not just the assigned agent — can read every buyer's NIN across the entire system.

**Remediation**
Restrict read access to NIN data to roles with a demonstrated need, consider field-level encryption at rest, mask the value in list/summary views, and add access logging for reads of this field.

---

### VULN-09 — Absence of CSRF Protection

| | |
|---|---|
| **Severity** | 🟠 HIGH |
| **CWE** | CWE-352: Cross-Site Request Forgery |
| **Location** | All state-changing routes (application-wide) |

**Description**
Every state-changing action (create, update, delete across produce, sales, credit sales, and users) is a standard HTML form POST. No CSRF token generation or validation middleware is present anywhere in the application.

**Evidence**
```js
// No csurf / equivalent middleware registered in app.js
```

**Impact**
A malicious external page can auto-submit a form to any of these endpoints using a logged-in victim's browser session, performing actions (e.g. deleting a sales record, creating a user) without the victim's knowledge.

**Remediation**
Adopt a CSRF-token middleware compatible with the session-based auth model in use, and validate the token on every state-changing request. If moving to a token/SPA-based frontend during the rebuild, use `SameSite=Strict` or `Lax` cookies plus origin-checking as a complementary control.

---

### VULN-10 — User Enumeration via Distinct Login Error Messages

| | |
|---|---|
| **Severity** | 🟡 MEDIUM |
| **CWE** | CWE-204: Observable Response Discrepancy |
| **Location** | `config/passport.js` |

**Description**
The login flow returns a different, specific message depending on whether the email was found or the password was wrong.

**Evidence**
```js
if (!user) {
  return done(null, false, { message: 'That email is not registered.' });
}
...
if (isMatch) { return done(null, user) }
else { return done(null, false, { message: 'Incorrect Password.' }) }
```

**Impact**
An attacker can enumerate which email addresses have registered accounts, aiding targeted credential-stuffing or phishing campaigns.

**Remediation**
Return a single generic message ("Invalid email or password") regardless of which check failed, and apply consistent response timing to reduce timing-based enumeration.

---

### VULN-11 — No Rate Limiting on Authentication Endpoint

| | |
|---|---|
| **Severity** | 🟡 MEDIUM |
| **CWE** | CWE-307: Improper Restriction of Excessive Authentication Attempts |
| **Location** | `routes/homeroutes.js` |

**Description**
The login POST route has no throttling, lockout, or CAPTCHA mechanism.

**Evidence**
```js
router.post('/', passport.authenticate('local', { ... }), (req, res) => { ... });
```

**Impact**
The login endpoint is open to unthrottled credential brute-forcing.

**Remediation**
Add `express-rate-limit` (or equivalent) scoped to the login route, with progressive backoff or temporary lockout after repeated failures from the same source.

---

### VULN-12 — Session Cookie Missing Explicit Security Flags

| | |
|---|---|
| **Severity** | 🟡 MEDIUM |
| **CWE** | CWE-614: Sensitive Cookie Without 'Secure' Attribute |
| **Location** | `app.js` |

**Description**
The `express-session` configuration does not set an explicit `cookie` option, so it relies on library defaults rather than an explicit, reviewed configuration for `secure`, `httpOnly`, and `sameSite`.

**Evidence**
```js
const expressSession = require('express-session')({
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
  // no explicit cookie: {...}
});
```

**Impact**
Without an explicit `secure: true` in production, the session cookie can be transmitted over plain HTTP, exposing it to network-level interception.

**Remediation**
Explicitly configure `cookie: { secure: true, httpOnly: true, sameSite: 'lax' }` (secure conditional on a production environment flag if HTTPS is not yet terminated locally), and terminate TLS in front of the app in any deployed environment.

---

### VULN-13 — Unhandled Promise Rejections in Route Handlers

| | |
|---|---|
| **Severity** | 🟡 MEDIUM |
| **CWE** | CWE-248: Uncaught Exception |
| **Location** | `routes/directorroutes.js` |

**Description**
The Director dashboard route performs several `await`ed database calls and aggregations directly inside the handler with no try/catch, unlike the equivalent controller-layer code elsewhere in the app.

**Evidence**
```js
router.get('/', async (req, res) => {
  const produce = await Produce.find(),
    sales = await Sale.find(),
    creds = await CreditSale.find();
  // ...no try/catch
```

**Impact**
A transient database error on this route surfaces as an unhandled rejection rather than a controlled error response, risking an inconsistent or crashed process state depending on the Node/Express version in use.

**Remediation**
Wrap all async route handlers in try/catch (or a centralized async-error wrapper) and route failures through consistent Express error-handling middleware.

---

### VULN-14 — Missing Security Hardening Middleware and Outdated Dependency Alignment

| | |
|---|---|
| **Severity** | ⚪ LOW |
| **CWE** | CWE-1104: Use of Unmaintained Third Party Components |
| **Location** | `package.json` |

**Description**
The dependency manifest has no standard Express hardening middleware (`helmet`, `express-rate-limit`, `express-mongo-sanitize`), and pairs `mongodb ^7.5.0` with `mongoose ^6.4.1`, versions that should generally be kept in step. `express ^4.18.1` should be reassessed against currently supported release lines during the rebuild.

**Evidence**
```json
"mongodb": "^7.5.0",
"mongoose": "^6.4.1",
"express": "^4.18.1"
```

**Impact**
Missing hardening middleware leaves several common Express-layer attacks (clickjacking, MIME-sniffing, verbose headers) unmitigated by default.

**Remediation**
Add `helmet` with sensible defaults, align MongoDB driver and Mongoose major versions, and run `npm audit` / a dependency-scanning tool as a routine CI step going forward.

---

### VULN-15 — Implicit Global Variable Declaration

| | |
|---|---|
| **Severity** | ⚪ LOW |
| **CWE** | CWE-1126: Declaration of Variable with Unnecessarily Wide Scope |
| **Location** | `routes/managerroutes.js`, `routes/directorroutes.js` |

**Description**
The Express router is assigned without a `const`/`let` declaration, creating an accidental global in non-strict mode.

**Evidence**
```js
router = express.Router();  // missing const/let
```

**Impact**
Low direct security impact, but indicates the codebase was not developed under linting or strict-mode enforcement, correlating with the broader lack of validation seen elsewhere.

**Remediation**
Declare all variables explicitly, enable ESLint with a strict ruleset, and add it as a CI gate.

---

## Positive Observations

Not every pattern in the codebase is a liability. The following practices were implemented correctly and are worth preserving in the rebuild:

- ✅ Passwords are hashed with bcrypt at a cost factor of 12, applied via a Mongoose pre-save hook that only re-hashes when the password field is actually modified.
- ✅ The password confirmation field is correctly stripped from the document before it is persisted, and the password field itself is marked `select: false` so it is excluded from default query results.
- ✅ The Passport local strategy correctly opts in to the password field only where needed (`.select('+password')`) for the comparison step.
- ✅ List-view queries for Sales and Credit Sales do apply a branch/agent scope filter, showing the author understood data-scoping requirements even though the pattern was not applied consistently across all routes (see VULN-04).

---

## Recommended Remediation Roadmap

**Phase 1 — Immediate (pre-rebuild)**
Rotate/replace the session secret, disable public access to the legacy instance if still deployed anywhere, and treat this report as the baseline for the redesign scope.

**Phase 2 — Access control redesign**
Design role-based middleware (`requireRole`) applied consistently across all route groups; design data-scoping filters (branch/agent ownership) as a reusable query helper rather than ad hoc per-controller logic.

**Phase 3 — Input handling**
Introduce schema-based request validation (e.g. Joi or Zod) at the route boundary for every mutating endpoint, with explicit field allowlists; eliminate direct `req.body` pass-through to Mongoose.

**Phase 4 — Platform hardening**
Add helmet, rate limiting, CSRF protection, explicit session cookie flags, and dependency/container scanning as part of a Dockerized DevSecOps pipeline with CI-gated SAST checks.

---
