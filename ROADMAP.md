# 4 Kilo Fellowship Ecosystem — Strategic Production Roadmap

> **Document Version:** 2.0.0-PROD  
> **Target Monorepo:** [`my-fellow`](https://github.com/natitam1/my-fellow)  
> **Last Updated:** November 2026  
> **Status:** Active Production Blueprint  

---

## Executive Summary

The **4 Kilo Christian Students Fellowship (AAU ECSF)** digital ecosystem serves thousands of university students and alumni across mobile, administrative web, public portal, and Telegram interfaces. With the successful unification into a modern Turborepo monorepo, 100% CI pass rate, automated Render API deployments, and OTA updates active on EAS, this roadmap sets out the senior engineering and design priorities required to achieve world-class reliability, security, and student engagement.

---

## 1. Senior Mobile Engineer Perspective
**Focus:** *Expo SDK 58, React Native 0.88, Hermes Bytecode, NativeWind v4, Offline Resilience, Media Playback*

### 1.1 Architecture & Performance Audit
* **Metro Bundling & Workspaces:** Direct resolution of `react-native-css-interop@0.2.7` and locking `@babel/plugin-transform-react-jsx@7.29.7` has stabilized both local exports and EAS Cloud builds.
* **Hermes Bytecode Profiling:** Production bundle size currently compiles to **7.2 MB** (`.hbc`). Further compression can be gained by tree-shaking icon families from `@expo/vector-icons` that are currently bundled in full (e.g. `MaterialCommunityIcons` at 1.3 MB).
* **Memory Footprint:** Audio devotion playback via `expo-audio` requires strict cleanup of player references upon screen unmount to prevent background memory leaks on lower-end Android devices (common among campus students).

### 1.2 Actionable Engineering Roadmap
1. **Offline-First Devotion & Sermon Caching:**
   - Implement local metadata persistence using MMKV or SQLite for downloaded text devotions and cached audio chunks.
   - Add download progress indicators and background sync when network connectivity transitions from offline (`no-internet.jpg`) to online.
2. **Audio Player Background Service Hardening:**
   - Ensure `FOREGROUND_SERVICE_MEDIA_PLAYBACK` notifications display real-time playback progress, scrubbing controls, and ministry attribution with lock-screen media controls.
   - Handle audio focus interruptions gracefully (e.g., incoming phone calls, campus alarms).
3. **Selective Icon Asset Subsetting:**
   - Migrate from bulk `@expo/vector-icons` font imports to SVG vector sprites or optimized single-family icon bundles to reduce the Android JS bundle by ~2.5 MB.
4. **Push Notification Pipeline:**
   - Configure Expo Push Token registration lifecycle tied to user authentication states (`UserModel.fcmTokens`).
   - Implement scheduled local notifications for the 6:00 AM daily devotion alert with streak reminders.
5. **EAS Build Automation & Release Tracks:**
   - Implement GitHub Actions workflow for automatic Internal Track APK generation on tag pushes (`v*.*.*`).
   - Enforce automated version code incrementing in `app.json` via EAS configuration hooks.

---

## 2. Senior Backend Engineer Perspective
**Focus:** *Node.js 24, Express 5, Prisma 7, MongoDB Mongoose, Render Deployment, GeezSMS, Jami Payments*

### 2.1 Backend Architecture & Database Audit
* **Dual Database Coordination:** Prisma handles structured PostgreSQL entities while Mongoose manages social posts, devotions, actors, and user profiles. Consistency across both datastores must be maintained via transaction wrappers or explicit retry mechanisms.
* **Actor RBAC Integrity:** The Actor model (`canPostAs`) guarantees that regular members can only post as themselves (`"me"`), while executive leaders and team coordinators post on behalf of official ministry teams (`Worship`, `Bible Study`, `Evangelism`, etc.).
* **Production Deployment:** Live on Render at `https://my-fellow-api.onrender.com` with auto-deploy filters configured for `apps/api/` and health monitoring at `/health`.

### 2.2 Actionable Engineering Roadmap
1. **SMS Gateway Failover & Cost Optimization:**
   - Current provider: GeezSMS for 6-digit OTP delivery.
   - Implement multi-gateway fallback (GeezSMS -> Afromessage -> Telegram Bot fallback) to ensure 99.9% delivery during telecom SMS congestions in Addis Ababa.
   - Enforce IP-based rate limiting (max 3 requests per 15 minutes) on `/api/auth/phone/send-otp` to protect against SMS flooding attacks.
2. **Database Indexing & Query Latency Optimization:**
   - Add compound indexes in MongoDB:
     - `PostModel`: `{ authorActorId: 1, createdAt: -1 }`, `{ tags: 1, createdAt: -1 }`
     - `DevotionModel`: `{ date: -1, isPublished: 1 }`
     - `ActorModel`: `{ handle: 1, type: 1 }`
   - Implement Redis or in-memory LRU caching for high-traffic read endpoints (`GET /api/devotions/today`, `GET /api/actors`).
3. **Jami Payment Webhook Idempotency:**
   - Implement strict HMAC signature validation and timestamp replay checks on `/api/payments/webhook`.
   - Store processed transaction IDs in an idempotent outbox collection to prevent duplicate giving credit.
4. **Cold-Start Mitigation on Render:**
   - Configure a lightweight uptime pinger or transition `my-fellow-api` to a persistent Render Web Service tier to eliminate the 50-second spin-down delay for morning prayer devotions.

---

## 3. Senior Web Engineer Perspective
**Focus:** *Next.js 16 App Router, React 19, Tailwind CSS v4, Admin Dashboard (`apps/admin`), Public Portal (`apps/website`)*

### 3.1 Web Architecture & Experience Audit
* **Next.js 16 + React 19 Alignment:** Both web applications use modern Server Components and Server Actions.
* **Admin Security:** Role-based route middleware (`middleware.ts`) protects dashboard routes, ensuring only users with `admin` or `super_admin` claims can view analytics, manage team assignments, or moderate content.
* **Public Portal SEO:** Public website requires dynamic OpenGraph meta tags and structured schema (`JSON-LD`) for campus events, sermon series, and fellowship statements of faith.

### 3.2 Actionable Engineering Roadmap
1. **Admin Content Moderation Workflow:**
   - Build a real-time moderation dashboard in `apps/admin` for reported community posts, comments, and writer submissions.
   - Add one-click post review, actor reassignment, and author strike tracking.
2. **Team Member Management & Roster Export:**
   - Implement a searchable member roster with filtering by Fellowship Team (`Worship`, `Prayer`, `Media`, etc.), academic department, and graduation year.
   - Enable CSV/Excel export for campus cell group leaders and fellowship elders.
3. **Public Website Event Registration & Giving Portal:**
   - Integrate public event RSVPs with QR-code ticket generation for annual conferences and freshers' welcome nights.
   - Connect the web-based Jami giving widget for alumni and diaspora fellowship partners.
4. **Core Web Vitals & Asset Optimization:**
   - Implement Next.js `<Image>` component optimization with AVIF/WebP formats for all fellowship photo galleries.
   - Audit and enforce WCAG 2.1 AA accessibility (color contrast on orange buttons, full keyboard navigation for modals).

---

## 4. Senior UI/UX Designer Perspective
**Focus:** *Android One UI & iOS HIG Safe Zones, Visual Hierarchy, Micro-interactions, Typography, Accessibility*

### 4.1 Design & Geometry Audit
* **Adaptive App Icon Safe-Zone Compliance:**
  - Android adaptive icons render on a 108dp (1024px) canvas, but OEM masks (Samsung squircle, Google circular, Xiaomi rounded square) crop the viewport down to **72dp (682px)**, with a guaranteed safe-zone of **66dp (625px)**.
  - Previous versions placed the logo artwork across 80%+ of the visible canvas, causing the "4KILLO ECSF" crossbar and the base figures to collide directly with the squircle mask.
  - **Resolution Applied:** Foreground artwork scaled to **400px height (~58% of viewport)**, centered with generous 140px margins. It now achieves identical visual weight, breathing room, and premium quality as Google Meet, Notion, and Music Player.
* **Color Palette & Contrast:**
  - Fellowship Primary: `#FF6719` (Vibrant Fellowship Orange).
  - Dark Mode Backgrounds: `#121212` / `#1A1A1A` with `#242424` card elevations.
  - Text: High-contrast white `#FFFFFF` and muted gray `#9E9E9E`.

### 4.2 Actionable Design Roadmap
1. **Home Screen Feed Visual Polish:**
   - Add subtle elevation shadows (`elevation: 2` on Android, soft blur on iOS) to daily devotion cards.
   - Design skeleton loaders with shimmering animations to replace raw loading spinners during cold data fetches.
2. **Interactive Audio Waveform Visualizer:**
   - Replace standard linear progress sliders on voice devotions with an audio waveform visualizer that tracks elapsed speaking time.
3. **Actor Distinction & Attribution Badges:**
   - Design distinct visual chips for post authors:
     - **Official Fellowship:** Orange badge with white cross icon and verified checkmark.
     - **Ministry Team:** Blue/Purple themed chips with team icon.
     - **Personal Member:** Rounded avatar with username handle.
4. **Haptic Feedback & Micro-interactions:**
   - Implement `expo-haptics` on devotion bookmarking, streak milestones, and post likes (`Haptics.impactAsync(ImpactFeedbackStyle.Light)`).

---

## 5. Product Manager Perspective
**Focus:** *Ecosystem Strategy, Student Engagement, Ministry Workflows, Retention Loops, Launch Readiness*

### 5.1 Fellowship Ecosystem Objectives
* **Primary Mission:** Empower 4 Kilo campus students in their daily walk with Christ through accessible scripture, community fellowship, prayer support, and seamless ministry coordination.
* **Key Persona Groups:**
  1. **Freshman Students:** Transitioning to university life; need directions, fellowship cell groups, and mentors.
  2. **Active Members:** Daily devotional readers, prayer request contributors, team volunteers.
  3. **Ministry Leaders:** Need publishing privileges for their teams, event scheduling, and roster oversight.
  4. **Fellowship Alumni & Diaspora:** Wish to stay spiritually connected and support the fellowship financially.

### 5.2 Actionable Product Roadmap & Milestones

| Milestone | Target | Key Deliverables | Success Metrics |
| :--- | :--- | :--- | :--- |
| **Phase 1: Zero-Friction Launch** | Week 1-2 | - Adaptive icon safe-zone update<br>- 100% reliable GeezSMS OTP verification<br>- Member post creation & personal actor support | - OTP delivery rate > 98%<br>- 0 app crash reports on launch |
| **Phase 2: Spiritual Habits & Retention** | Week 3-4 | - 6:00 AM daily devotion push notification<br>- Prayer request & testimony feed<br>- 7-day devotion reading streak badges | - D1 retention > 65%<br>- D7 retention > 40%<br>- Daily Active Users (DAU) > 1,500 |
| **Phase 3: Ministry Collaboration** | Month 2 | - In-app team rosters & announcements<br>- Writer approval portal for student authors<br>- Event check-in via QR codes | - 8/8 ministry teams active<br>- 100% of weekly services published |
| **Phase 4: Giving & Fellowship Expansion** | Month 3 | - Verified Jami mobile payments (Telebirr/CBE)<br>- Financial transparency summary reports<br>- Public website sermon archive | - 100% payment verification accuracy<br>- Zero payment discrepancies |

---

## 6. Implementation Checklist & Verification

- [x] **Monorepo Unification:** 5 private repos consolidated into single Turborepo monorepo at `/home/nati/Projects/my-fellow-monorepo`.
- [x] **Clean Git History:** 1,058 conventional commits pushed to `https://github.com/natitam1/my-fellow.git` under `natitam1` noreply identity.
- [x] **Continuous Integration:** Root `ci.yml` passing all lint, build, typechecks, and 50/50 backend tests.
- [x] **Backend Live:** `https://my-fellow-api.onrender.com` healthy with MongoDB connected and actor security enforced.
- [x] **Super Admin Configured:** `0994627985` (`Natnael Tamiru`) promoted to `super_admin` in database.
- [x] **Mobile Bundling Repaired:** Missing `react-native-css-interop` dependency resolved; `expo export` passes cleanly with Hermes bytecode generation.
- [x] **Adaptive Icon Safe-Zone Perfected:** Scaled to 400px height (58% viewport) with 140px margins for Samsung squircle masks.
- [x] **Over-The-Air Update Published:** EAS Update `f95cac17-24cb-4608-9e4b-19739ef89631` live on `production` Android branch.
- [x] **Multi-Role Strategic Roadmap:** Formatted and committed to `ROADMAP.md`.
