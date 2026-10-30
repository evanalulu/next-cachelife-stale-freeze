# next-cachelife-stale-freeze

A `'use cache'` value never refreshes when its `cacheLife` profile has `stale`
under 30 seconds and `expire` of 300 seconds or more. It keeps the value from
`next build`. Its `revalidate` timer, its `expire`, `revalidateTag` and a
restart of `next start` don't change it. `revalidatePath` replaces it once, and
the new value is then stuck in the same way.

Reproduced on `next@16.5.0-canary.34` (the version in `package-lock.json`) and
`next@16.4.3`, with React 19.3.1 and Node 24.13.1, and with `partialPrefetching`
set to `true`, `false` or left out.

The two pages are identical except for their profile, in `next.config.ts`:

| Page      | stale | revalidate | expire |
| --------- | ----- | ---------- | ------ |
| `/frozen` | 0     | 15         | 300    |
| `/ok`     | 30    | 15         | 300    |

## Steps

```bash
npm ci
npm run build
npm start
```

`next build` lists no Revalidate or Expire for `/frozen`, and `15s 5m` for `/ok`.

In a second terminal:

```bash
# 1. Note the value
curl -s localhost:3000/frozen | grep -o 'data-v="[^"]*"'

# 2. revalidateTag("frozen", "max"); the first request after it starts the refresh
curl -s -X POST 'localhost:3000/api/revalidate?tag=frozen'
curl -s localhost:3000/frozen > /dev/null; sleep 1
curl -s localhost:3000/frozen | grep -o 'data-v="[^"]*"'

# 3. Wait past revalidate (15s); the first request after it starts the refresh
sleep 20
curl -s localhost:3000/frozen > /dev/null; sleep 1
curl -s localhost:3000/frozen | grep -o 'data-v="[^"]*"'
```

`/frozen` prints the same value all three times.

Then repeat steps 1 to 3 with every `frozen` replaced by `ok`, including
`tag=frozen`. `/ok` prints a new value after step 2 and again after step 3.

```bash
# 4. revalidatePath("/frozen") does replace it
curl -s -X POST 'localhost:3000/api/revalidate?path=/frozen'
curl -s localhost:3000/frozen > /dev/null; sleep 1
curl -s localhost:3000/frozen | grep -o 'data-v="[^"]*"'
```

`/frozen` prints a new value. Steps 2 and 3 then leave that one unchanged too.

If port 3000 is taken, use `npm start -- -p <port>` and change the URLs to match.

## Also checked

- Waiting past `expire` (5 minutes), or restarting `npm start` without
  rebuilding: `/frozen` still prints the value from step 1.
- `revalidateTag(tag, { expire: 0 })` instead of `"max"`: still unchanged.
- At the thresholds: `stale: 29` is stuck, and `stale: 0` with `expire: 299`
  refreshes.
- Without the `<Live />` component (the `connection()` call): still stuck.

## What the build output shows

- `.next/server/app/frozen.html` has only the `loading` fallback for the
  cached component. The value is in the route's resume data cache instead: the
  `postponed` field of `.next/server/app/frozen.meta` holds the entry
  (`stale: 0`, `revalidate: 15`, `expire: 300`, tag `frozen`) with the build's
  timestamp.
- The `x-next-cache-tags` header in `frozen.meta` does not include `frozen`.
  The one in `ok.meta` includes `ok`.
