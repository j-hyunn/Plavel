---
trigger: always_on
---

# API Specification (MVP)

## Auth

POST /api/auth/login

---

## Posts

GET /api/feed
POST /api/posts
GET /api/posts/:id

---

## Engagement

POST /api/posts/:id/like
DELETE /api/posts/:id/like

POST /api/posts/:id/comments
GET /api/posts/:id/comments

POST /api/posts/:id/bookmark
DELETE /api/posts/:id/bookmark

---

## User

GET /api/users/:id
POST /api/users/:id/follow
DELETE /api/users/:id/follow