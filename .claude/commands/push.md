# push

Git push workflow with optional Jira comments for all unpushed commits that reference a CL ticket.

## Usage

```
/push
```

## Steps

1. Get the current branch name:
   ```bash
   git rev-parse --abbrev-ref HEAD
   ```

2. Get all unpushed commits (not yet on remote):
   ```bash
   git log origin/<branch>..HEAD --pretty=format:"%H %s"
   ```
   - If the branch has no remote tracking yet, use `git log --pretty=format:"%H %s"` and note all commits.

3. Run `git push` to push the current branch to the remote.
   - If push fails, report the error and stop.

4. For **each** unpushed commit from step 2:

   a. Check if the subject starts with `CL-` (e.g. `CL-42 feat: ...`).
      - If not, skip this commit.

   b. If it starts with `CL-`, extract the ticket key (e.g. `CL-42`).

   c. Run `git show <hash> --stat` to get changed files and diff summary for that commit.

   d. Use `mcp__jira__getTeamworkGraphContext` with:
      - `cloudId`: `"kimcj5434.atlassian.net"`
      - `objectType`: `"JiraWorkItem"`
      - `objectIdentifier`: the extracted ticket key (e.g. `"CL-42"`)
      - `detailLevel`: `"summary"`

   e. Use `mcp__jira__getTeamworkGraphObject` with `cloudId`: `"kimcj5434.atlassian.net"` to fetch the ticket's current title and description for context.

   f. Compose a Korean comment summarizing the commit. The comment must include:
      - 어떤 브랜치에서 푸시되었는지
      - 해당 커밋 메시지 (한글 번역)
      - 변경된 파일 목록 (git show --stat 기반)

      Format:
      ```
      🚀 **코드 푸시 알림**

      - **브랜치**: `<branch>`
      - **커밋**: `<subject>`

      **변경 파일**
      - <file1>
      - <file2>
      ...
      ```

   g. Post the comment to the Jira ticket using the available MCP tool.
      - If the MCP does not support comment creation, display the composed comment to the user so they can post it manually.

5. Report a summary: how many commits were pushed, and which tickets received comments.
