# push

Push commits to remote and add Korean-translated commit comments to linked Jira tickets.

## Steps

1. Collect all unpushed commits **before** pushing:

```bash
git log @{u}..HEAD --format="%H %s" 2>/dev/null || git log origin/HEAD..HEAD --format="%H %s" 2>/dev/null
```

   This returns one line per commit: `<HASH> <SUBJECT>`. Save the full list.

2. Filter the list: keep only commits whose subject starts with `CL-` (e.g., `CL-42 feat: ...`).
   For each filtered commit, run:

```bash
git log -1 --format="%s%n%n%b" <HASH>
```

   Save the output as that commit's full message. Repeat for every CL- commit.

3. Run `git push`.

4. For **each** CL- commit from step 2 (process all of them, not just the first):

   a. Extract the ticket key: the first whitespace-delimited token of the subject (e.g., `CL-42`).

   b. Translate the full commit message (subject + body) into Korean. Keep technical terms, file names, and CLI flags in English. Use natural Korean phrasing.

   c. Build the comment body:

      ```
      [자동 코멘트] 연결된 커밋이 푸시되었습니다.

      **원문 (영어)**
      <FULL_COMMIT_MESSAGE>

      **번역 (한국어)**
      <KOREAN_TRANSLATION>
      ```

   d. Post the comment to Jira:

      ```bash
      curl -s -X POST \
        -H "Authorization: Basic $(echo -n "${JIRA_EMAIL}:${JIRA_API_TOKEN}" | base64 -w 0)" \
        -H "Content-Type: application/json" \
        -d "{\"body\": {\"type\": \"doc\", \"version\": 1, \"content\": [{\"type\": \"paragraph\", \"content\": [{\"type\": \"text\", \"text\": \"<JSON_ESCAPED_COMMENT>\"}]}]}}" \
        "${JIRA_BASE_URL}/rest/api/3/issue/<TICKET>/comment"
      ```

      `<JSON_ESCAPED_COMMENT>` is the comment body with `\`, `"`, and newlines JSON-escaped.

5. Report results: list each ticket commented on, and note any failures.
