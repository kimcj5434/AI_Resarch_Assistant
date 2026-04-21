# commit

Standard git commit workflow without a Jira ticket.

## Steps

1. Run `git status` and `git diff HEAD` to understand all pending changes.
2. Stage all relevant changed files with `git add <files>` (exclude secrets, binaries, or unrelated files).
3. Draft the commit message:
   - **Subject** (required): `<type>: <what changed>` — imperative mood, under 72 chars, in English.
     - Types: `feat`, `fix`, `docs`, `refactor`, `chore`, `test`, `style`
   - **Body** (recommended): include when the subject alone leaves out useful context. Write in plain English, wrap at 72 chars. Cover any of the following that apply:
     - **Why**: motivation or business reason for the change
     - **What changed**: key decisions, components added/removed, approach taken
     - **Side effects / caveats**: behaviour changes, performance impact, known limitations
     - **Breaking changes**: prefix with `BREAKING CHANGE:` and describe migration steps
4. Create the commit:

```bash
git commit -m "$(cat <<'EOF'
<type>: <subject>

<body>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

5. Run `git status` to confirm the commit succeeded.
