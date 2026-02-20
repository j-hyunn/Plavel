---
trigger: always_on
---

# Data Model

## User

- id
- nickname
- avatarUrl
- bio
- createdAt

---

## Post

- id
- authorId
- title
- coverImageUrl
- travelStartDate (optional)
- travelEndDate (optional)
- createdAt

---

## DayPlan

- id
- postId
- dayNumber
- title (optional)
- description

---

## Like

- userId
- postId
- createdAt

---

## Comment

- id
- postId
- authorId
- content
- createdAt

---

## Bookmark

- userId
- postId
- createdAt

---

## Follow

- followerId
- followingId
- createdAt