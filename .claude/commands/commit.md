# commit

Standard git commit workflow without a Jira ticket.

## Steps

1. Run `git status` and `git diff HEAD` to understand all pending changes.
2. Stage all relevant changed files with `git add <files>` (exclude secrets, binaries, or unrelated files).
3. Draft the commit message:
   - **Subject** (required): `<type>: <what changed>` — imperative mood, under 72 chars, in English.
     - Types: `feat`, `fix`, `docs`, `refactor`, `chore`, `test`, `style`
   - **Body** (optional): add only when the subject alone doesn't explain the *why* or scope. Keep it to 2–3 lines max.
4. Create the commit (include body only if needed):

```bash
git commit -m "$(cat <<'EOF'
<type>: <subject>

<optional body>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

5. Run `git status` to confirm the commit succeeded.
