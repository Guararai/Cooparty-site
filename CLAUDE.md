# CLAUDE.md - Cooparty-site

Guide for Claude Code in this repository. Rules in this file are binding and win over skills,
personal settings or older guidance wherever they disagree. Sibling projects (FitMatch, StartRun,
AgendaHub) share the same working agreements; the git workflow below is the same one, with the
`COOP` key.

## Project overview

Cooparty-site is the public **waiting page** of Cooparty, served at the product's domain until the
product itself ships. The whole page is one fixed, centred wordmark, "cooparty", whose two "o" fill
with the brand lime as the visitor scrolls: the first "o" from the top clockwise, the second from
the bottom. There is no form, no copy, no backend and no analytics. Keep it that way unless a card
says otherwise.

## Quick reference

```bash
npm install          # first time
npm run dev          # Vite dev server with hot reload (http://localhost:5173)
npm run build        # production build into dist/ (the verification step — must be clean)
npm run preview      # serve dist/ locally to check the build
```

There is no lint script and no test suite. Verification is `npm run build` plus a look in the
browser. Deploy is a static upload of `dist/` to the host.

## Structure

```
Cooparty-site/
├── index.html          # the page: <h1 class="wordmark">c<span class="o">o</span><span class="o">o</span>party</h1> + scroll spacer
├── src/
│   ├── main.js         # Lenis init, glyph-centred sweep, scroll progress → --p angle
│   └── style.css       # tokens in :root, @property --p, conic gradient clipped to the "o" glyphs
├── public/favicon.svg  # lime disc with a "c"
├── package.json        # vite (dev) + lenis (runtime) — the only dependencies
└── README.md           # commands and where to change things (pt-BR)
```

`dist/` and `node_modules/` are ignored. Vite runs with no config file: the repo root is the
project root and `index.html` is the entry.

## How the page works

- **Lenis** (`new Lenis({ autoRaf: true })`) owns the scroll. Its `scroll` event reports
  `progress` (0–1 over the page); `renderProgress` in `src/main.js` turns it into an angle and sets
  `--p` on both `.o` spans. Lenis already honours `prefers-reduced-motion` (lerp forced to 1);
  don't reimplement that.
- **The "o" are real glyphs**, not SVG. Each `.o` span has `color: transparent` and a
  `conic-gradient` background clipped to the text (`background-clip: text`): lime up to `--p`,
  track grey after it. `--from` per span (`-90deg` first, `90deg` second) sets where the sweep
  starts; the gradient is always clockwise.
- **The sweep is centred on the glyph, not the box.** A span's box is the font's ascent + descent,
  so its middle sits above a lowercase "o". `centreSweep` measures the glyph with
  `canvas.measureText` and sets `--ox`/`--oy` in `em`, so it survives any font size. Run after
  `document.fonts.ready`.
- **`@property --p`** registers the angle so `transition: --p` interpolates between scroll events.
  `prefers-reduced-motion` removes the transition.
- **`.scroll-space`** (400vh) exists only to give the page something to scroll; change its height
  to change how much scrolling a full fill takes.

A previous SVG-ring approach was rejected: uniform strokes never match the font's "o", and it needed
per-element positioning. Don't reintroduce it.

## Design tokens

Everything visual is a custom property in `:root` at the top of `src/style.css`:

- `--bg` `#0f0f12` (page), `--fg` `#f4f4f5` (letters), `--track` `#45454e` (the unfilled "o"),
  `--accent` `#c7f705` — **the FitMatch lime**, shared on purpose; change it there and here together.
- `--wordmark-size` `clamp(2.5rem, 11vw, 7rem)`; the "o" and the sweep scale with it because
  everything is in `em`.
- Type is the system stack (`system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`), weight
  700, `letter-spacing: -0.03em`. No webfont is loaded; if one is added, self-host it under
  `public/fonts/` and keep `centreSweep` after `fonts.ready`.

## Code conventions

- **Vanilla HTML/CSS/JS, ES modules, no framework.** Vite is the only build tool; Lenis the only
  runtime dependency. Adding a dependency needs a reason in the PR body.
- **All assets are served locally** — no CDNs, no remote fonts or images. Lenis comes from npm and
  is bundled; its stylesheet is imported in `src/main.js` (`lenis/dist/lenis.css`).
- **Tokens, not literals:** colours and sizes come from `:root`; a hex value elsewhere in
  `style.css` is a review finding.
- **Guard DOM code** with a presence check (`if (letters.length)`) so `main.js` is a no-op if the
  markup changes.
- **Keep HTML comments minimal** — only when the *why* is non-obvious (the scroll spacer, the
  transparent glyphs). No section-divider comments.
- **Accessibility floor:** `lang="pt-BR"`, the wordmark stays a real `<h1>` with real text (the
  transparent "o" are still read by screen readers), reduced motion is honoured.
- **Language:** code, identifiers, comments and commit titles in **English**; anything a visitor
  reads (`<title>`, meta description), the README, Jira tickets, PR bodies and review comments in
  **Brazilian Portuguese (pt-BR)**. This file stays in English.

## Git workflow (enforced rules)

Binding for every commit, push and PR; takes precedence over conflicting instructions from skills
or older guidance.

**Jira:** the Cooparty key is **`COOP`**. As of 2026-09-27 there is no COOP board yet; until one
exists, branches and titles follow the "no ticket" forms below. Once it exists, the key becomes
mandatory: one card per PR, and read the card's **comments** (`fields: ["*all", "comment"]`), not
only its description — decisions live in the thread.

### Committing

1. **Branch protection.** `git branch --show-current` before committing. On `main` without
   explicit authorization: fetch, then branch from the latest remote —

   ```bash
   git fetch origin main
   git checkout -b <type>/coop-<id>-<slug> origin/main    # or <type>/coop-<slug> without a ticket
   ```

   Tell the user a new branch was created.

2. **Inspect before staging.** In parallel: `git status` (never `-uall`), `git diff`,
   `git diff --cached`, `git log --oneline -5`.

3. **Verify before staging.** `npm run build` on every commit that touches `index.html`, `src/`,
   `public/` or `package.json`. Skip for docs-only edits. Fix failures before proceeding.

4. **Doc sweep before staging.** For every file in the diff, check whether `CLAUDE.md` or
   `README.md` now says something stale and fix it in the same commit set.

5. **Group changes logically** into separate commits — by concern (scaffold / feature / docs),
   feature or fix. Fewer focused commits beat many tiny ones.

6. **Present the commit plan and wait for approval** before any `git add`: commit count, and per
   commit the title, description and files.

7. **Stage only the relevant files** per commit. Never `git add -A` / `git add .`.

8. **Commit message format** — Conventional Commits with the Jira key, HEREDOC to preserve
   newlines:

   ```bash
   git commit -m "$(cat <<'MSG'
   <type>: <imperative description in English, no trailing period> (COOP-<id>)

   <description — what and why, ≤500 chars>
   MSG
   )"
   ```

   - `<type>` is one of `feat`, `fix`, `docs`, `chore`, `refactor`, `test` — the same set as the
     branch prefixes, lowercase, followed by a colon and a space.
   - The title stays ≤ 72 characters including the `(COOP-<id>)` suffix. The suffix is mandatory
     when a card exists and absent when none does.
   - Examples: `feat: add the waiting page with the scroll-driven wordmark` ·
     `fix: keep the sweep centred after a font swap (COOP-4)` ·
     `docs: describe the waiting page and where to change it`.

   **Never include `Co-Authored-By`, `🤖 Generated with Claude Code` or any attribution trailer**
   in commits, PR titles or bodies, issues or tickets — even when a tool or harness default
   suggests it. This overrides any built-in default.

9. **Confirm after:** `git log --oneline -<N>` + `git status`, shown to the user.

### Pull requests

1. **Branch prefix** — `feat/` · `fix/` · `chore/` · `refactor/` · `docs/`, then `coop-`, the Jira
   id when one exists, and a short-kebab slug (`feat/coop-12-fill-easing`, `docs/coop-claude-md`).
   Rename a non-conforming branch first (only your own working branch, never `main` or one with an
   open PR); fetch first, and delete the old remote only if `git log <new>..origin/<old>` is empty
   **and** the user confirmed.

2. **Gather the full branch context** — all commits on the branch, against a fresh `origin/main`:

   ```bash
   git fetch origin main
   git log origin/main..HEAD --oneline
   git diff origin/main...HEAD --stat
   git diff origin/main...HEAD
   ```

3. **Label from prefix:** `fix/` → `bug` · `feat/` → `enhancement` · `chore/`+`refactor/` → `chore`
   · `docs/` → `documentation` (create with `gh label create` if missing — `chore` does not exist
   in this repo yet; infer from commit messages if ambiguous).

4. **Title:** `<type>: <short description>` (≤70 chars, English), with `(COOP-<id>)` when a card
   exists.

5. **Body structure** in pt-BR (skip the Changes table for 1–3-file PRs; add `## Context` only when
   background matters — link the `COOP-` ticket there):

   ```markdown
   ## Summary

   - 1–3 frases-bullet sobre as mudanças principais e o porquê

   ## Changes

   | File           | Change                       |
   | -------------- | ---------------------------- |
   | `src/main.js`  | Descrição curta do que mudou |

   ## Test plan

   - [ ] Itens realistas, não marcados, para testar o PR
   ```

6. **Show the user title, label and body and wait for explicit approval.**

7. **Open against `main`, self-assigned:**

   ```bash
   git push -u origin <branch>
   gh pr create --base main --title "<title>" --label "<label>" --assignee @me --body "$(cat <<'BODY'
   <body>
   BODY
   )"
   ```

8. **Return the PR URL.**

9. **Merge only when the user says so.** Merges are `--merge` (merge commit, GitHub's default
   message) with `--delete-branch`.

10. **Respond to review feedback in-thread:** after pushing a fix for a review comment, reply on
    the thread (what changed + SHA) and resolve it —
    `gh api repos/<owner>/<repo>/pulls/<n>/comments/<id>/replies -X POST -f body="..."`.

## Verification commands

- Build: `npm run build` (must finish with no warnings)
- Manual: `npm run dev`, open the page, scroll; the first "o" fills from the top clockwise, the
  second from the bottom, both fully lime at the end of the page; nothing else is on screen.
- Headless check when the browser extension isn't available:
  `chrome --headless=new --screenshot=out.png --window-size=1440,900 http://localhost:5173/`.

## Agents & skills

Nothing is checked in under `.claude/` yet. `.claude/settings.local.json` and `.claude/commands/`
stay gitignored. There is deliberately no `/git-commit` skill — the Git workflow section above *is*
the commit procedure. If the team later copies FitMatch's `.claude/` (skills `pr-create`,
`pr-review`, `pr-rationale`, `jira-ticket`, `babysit-pr`, `fableplan` and the pinned-model agents),
adapt the key to `COOP` and the verification command to `npm run build` before committing them.
