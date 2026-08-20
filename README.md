# Runners League

러너들이 장비(Gear), 러닝 데이터, 레이스 정보, 트레이닝 노하우를 나누는 러닝 커뮤니티.

## Stack

- **Next.js (App Router)** + TypeScript — 프론트엔드/백엔드(API Routes) 단일 모노레포
- **Prisma 7** + PostgreSQL (`@prisma/adapter-pg` 드라이버 어댑터 사용)
- Strava/Garmin OAuth 연동으로 러닝 데이터 자동 동기화 (예정)

## Domain Modules

| 경로 | 도메인 |
|---|---|
| `/feed` | 팔로우한 러너들의 활동(러닝 기록) 피드 |
| `/gear` | Gear Locker — 신발/워치/장비 등록 및 마일리지 추적 |
| `/races` | Race Hub — 레이스 캘린더 및 참가 후기 |
| `/training` | 트레이닝 플랜, 아티클, Q&A |
| `/profile/[username]` | 사용자 프로필 |

API 라우트(`/api/activities`, `/api/gear`, `/api/races`)는 각 도메인의 서버 로직을 담당합니다.

## Data Model

`prisma/schema.prisma`에 전체 스키마가 정의되어 있습니다. 핵심 엔티티:

- `User` / `Follow` — 사용자 및 팔로우 관계
- `ExternalAccount` — Strava/Garmin OAuth 연동 토큰
- `Gear` / `GearReview` — 보유 장비 및 리뷰
- `Activity` / `ActivityGear` — 러닝 기록 및 사용 장비 연결(마일리지 자동 집계용)
- `Race` / `RaceEntry` — 레이스 및 참가 기록
- `Post` — 트레이닝 플랜/아티클/질문
- `Comment` / `Like` — 활동/포스트 공통 인터랙션

## Getting Started

1. `.env`에 `DATABASE_URL` 설정 (로컬 Postgres 또는 `npx prisma dev`)
2. 마이그레이션 적용

```bash
npx prisma migrate dev --name init
```

3. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인.

## Roadmap

- **Phase 1**: User + Gear Locker + Activity 수동 기록/피드
- **Phase 2**: Strava OAuth 연동으로 활동 자동 동기화, 장비-마일리지 자동 집계
- **Phase 3**: Race Hub + Gear Review + Training Content 확장
