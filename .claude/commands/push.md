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

   d. Post the comment to Jira using a Python heredoc to build valid ADF JSON.
      Split the comment on newlines — each line becomes its own `paragraph` node; empty lines become empty paragraphs.
      This is required because Jira's ADF renderer does not treat `\n` inside a single paragraph as a line break.

      ```bash
      python3 << 'PYEOF'
import json, os, urllib.request, base64

comment = """<COMMENT_BODY>"""

lines = comment.split('\n')
content = []
for line in lines:
    if line == '':
        content.append({"type": "paragraph", "content": []})
    else:
        content.append({"type": "paragraph", "content": [{"type": "text", "text": line}]})

payload = json.dumps({"body": {"type": "doc", "version": 1, "content": content}}).encode()
token = base64.b64encode(f"{os.environ['JIRA_EMAIL']}:{os.environ['JIRA_API_TOKEN']}".encode()).decode()
req = urllib.request.Request(
    f"{os.environ['JIRA_BASE_URL']}/rest/api/3/issue/<TICKET>/comment",
    data=payload,
    headers={"Authorization": f"Basic {token}", "Content-Type": "application/json"},
    method="POST"
)
with urllib.request.urlopen(req) as r:
    print(r.status, r.read().decode()[:200])
PYEOF
      ```

      Replace `<COMMENT_BODY>` with the actual multiline comment text and `<TICKET>` with the ticket key.

5. Report results: list each ticket commented on, and note any failures.
