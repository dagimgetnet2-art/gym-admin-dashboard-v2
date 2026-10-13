# Test results

What was actually executed, and what was not.

## Executed and passed

| Check | How | Result |
|---|---|---|
| Syntax of all 88 source files (JSX included) | TypeScript parser (`transpileModule`, JSX preserved) | 0 errors |
| Relative imports resolve to real files | custom script | 0 missing |
| Named and default imports exist in the target module | custom script | 0 missing |
| Unused imports | custom script | 0 remaining |
| Pure logic: Addis-time conversion and round trip, session-window maths, password rule, email/phone/range validators, V1 and V2 error normalization, missing-route detection, network/timeout classification | `tsx` against `src/utils/*` | 12 of 12 passed |

## Not executed

| Check | Why |
|---|---|
| `npm install` | The sandbox cannot reach the npm registry. The command produced no output and no `node_modules`. |
| `npm run build`, dev server | Depends on the install. **The production build has not been verified.** |
| Live API calls, login flows, CORS | Network access is off and the Render site blocks automated fetching. No credentials were used or stored. |
| Rendering, routing, responsive layouts, loading and error states in a browser | Needs the build. Verified by code review only. |

## Run these first on your machine

```bash
npm install
npm run build        # expect: dist/ created, no errors
npm run dev          # http://localhost:5173
```

Then, in order: sign in as each role; open a member booking and watch the browser network tab for the `quote` and `checkout` bodies (confirms the `packageId` / `bookingId` choices); check which `/api/v1` pages show "Not available on this server yet".

If a request fails: a CORS error in the console means the backend origin list; a 404 on `/api/v1/...` means the endpoint is not deployed; a 400 with field names means a request body in `src/config/apiShape.js` or the page form needs adjusting.
