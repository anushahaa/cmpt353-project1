# Channel-Based Programming Q&A Tool

This project is a channel-based programming Q&A system built with Next.js, Prisma, PostgreSQL, and Docker.

## Features implemented so far
- Landing page explaining the tool
- Channel list, create, and select
- Posts inside channels
- Replies to posts
- Nested replies to replies
- Screenshot uploads and display
- Accounts: sign up, sign in, sign out
- Auth required for all write actions
- Admin moderation: delete users, channels, posts, and replies
- Voting on posts and replies
- Voting states: up, down, neutral
- Recursive threaded reply tree
- Dedicated search page with pagination/load more

## Search query types implemented
1. Substring search across posts + replies
2. Content by a specific author
3. User with most posts
4. User with least posts
5. Highest-ranked content
6. Lowest-ranked content

## Search implementation notes
- Dedicated route: `/search`
- Pagination uses a "Load more" button
- Results include content context and links
- Searched fields:
  - substring: `post.title`, `post.body`, `reply.body`
  - author: `user.displayName`, `post.authorId`, `reply.authorId`
  - most/least posts: `user.displayName`, `post.authorId`
  - ranked content: vote data on posts and replies
- Ranking formulas:
  - substring: newest content first
  - author: newest author content first
  - most/least posts: sorted by post count
  - ranked content: net score, then time

## Tech stack
- Next.js 14
- Prisma ORM
- PostgreSQL
- Docker Compose

## Run with Docker
```bash
docker compose up --build