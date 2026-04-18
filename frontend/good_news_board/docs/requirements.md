# Good News Board Frontend — Requirements

## Core Features

- CF-01: Good news collection — display articles as a card list (source, collected time, headline, reason)
- CF-02: Headline search — real-time card filtering by keyword input
- CF-03: Date filter — filter articles by start date ~ end date range
- CF-04: Article management — manually add, edit, and delete articles

## Functional

- UI-01: Build with Next.js (App Router) + TypeScript
- UI-02: Display articles as a card list
- UI-03: Each card shows headline, source (newspaper), collected time, published date, and reason why it is good news
- UI-04: Clicking a headline opens the original article in a new tab
- UI-05: Sort cards by date (newest / oldest)
- UI-06: Support pagination or infinite scroll for large article lists
- UI-07: Add article via a form modal (headline, source, URL, published date, reason)
- UI-08: Edit article — open pre-filled form modal from the card menu
- UI-09: Delete article — confirm before deletion; remove card on success

## Non-Functional

- NF-01: Independently deployable as a containerized service
- NF-02: Responsive layout — readable on both desktop and mobile
