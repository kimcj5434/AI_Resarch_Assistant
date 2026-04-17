# commit-jira

Git commit workflow linked to a Jira ticket, with optional comment body.

## Usage

```
/commit-jira CL-42
/commit-jira CL-42 "refactor crawler retry logic for readability"
```

- First argument: Jira ticket (e.g. `CL-42`) — **required**. If not provided, ask the user before proceeding.
- Second argument: commit comment — **optional**. Used as the commit body.

## Steps

1. If no Jira ticket is provided, ask: "Which Jira ticket should this commit be linked to? (e.g. CL-42)"
2. Follow all steps in @.claude/commands/commit.md, with these overrides:
   - **Subject format**: `<TICKET> <type>: <what changed>` (e.g. `CL-42 refactor: extract retry logic into BaseCrawler`)
   - **Body**: use the user-provided comment if given; otherwise follow the same body rules as `/commit`.
