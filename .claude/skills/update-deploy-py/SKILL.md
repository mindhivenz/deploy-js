---
name: update-deploy-py
description: This skill should be used when the user asks to "update deploy-py", "port deploy-js to deploy-py", "sync deploy-py", "reconcile the python port", or wants to bring the deploy-py Python port back in line with this repo (deploy-js, the source of truth) and open a PR for any drift.
---

# Update deploy-py from deploy-js

This repo (`deploy-js`, TypeScript) is the source of truth. `deploy-py` is a
Python port of it. When deploy-js changes, port the change into deploy-py and
open a PR there. This runs both in CI (push to `master`) and locally for a
developer driving Claude Code by hand.

## Get latest deploy-py

Always clone the latest default branch (`main`) of deploy-py into a fresh temp
dir. Do not reuse a local sibling checkout, which may be stale. deploy-py is the
target you edit; this repo (deploy-js) is read-only reference.

```bash
DEPLOY_PY=$(mktemp -d)
gh repo clone mindhivenz/deploy-py "$DEPLOY_PY" -- --depth 1 --branch main
```

`gh` uses `GH_TOKEN` in CI and the developer's auth locally.

## Task

1. Identify what changed in deploy-js. In CI, look at the latest push to
   `master` (`git log -p -1`, or diff against the previous commit). Locally,
   review recent commits the developer points you at. Focus on `src/`.
2. Map each changed deploy-js source file/function to its deploy-py counterpart
   under `$DEPLOY_PY/src/mindhivenz/deploy/`. Naming converts TS camelCase to
   Python snake_case (e.g. `userRoleName.ts` -> `user_role_name.py`).
3. If deploy-py already reflects the change, STOP. Do not open a PR, do not
   commit, do not create a branch. Print a short note that deploy-py is in sync
   and exit.
4. Before doing any work, check deploy-py for an already-open PR from a previous
   run (branch prefix `deploy-js-sync/` or PR title starting with
   "Sync from deploy-js"). If one exists and already covers the change, STOP and
   do nothing.
5. If there IS new drift to apply: in `$DEPLOY_PY`, create a branch named
   `deploy-js-sync/<short-date-or-topic>`, edit only files under `$DEPLOY_PY`
   (never anything in this deploy-js repo) to match the deploy-js change, then
   run the tests with `uv run pytest`. Use `uv` / `uv run` for all Python
   commands.
6. Commit and open a PR against `main` on deploy-py, requesting `timvan` as a
   reviewer (`gh pr create --reviewer timvan`). If running locally as `timvan`
   (you cannot request review from yourself), omit the flag. In the PR body, list
   each ported change as: the deploy-js source (file + function), the deploy-py
   target file, what changed, and the reason. Link the specific deploy-js commit
   and lines on GitHub. Do not merge.

## Constraints

- deploy-js (this repo) is reference only. Never modify, commit to, or push it.
- Keep edits minimal and faithful to deploy-js. Port behavior, do not refactor
  unrelated deploy-py code or invent functionality not present in deploy-js.
- Match deploy-py's existing idioms (typer, snake_case, project layout). Do not
  transliterate TypeScript style into Python.
- Ignore changes confined to deploy-js build artifacts (`dist/`), tooling, or
  packaging that have no behavioral equivalent in deploy-py.
- If tests fail and you cannot make them pass with a faithful port, open the PR
  anyway as a draft and describe the failure in the body.
