# AI Interview Platform Documentation

This document explains the repository as it exists today. It is intentionally descriptive: it does not change application behavior. The project is a two-package full-stack application with a React/Vite client and an Express/Mongoose server.

## 1. Repository Map

```text
Ai-Interview main/
  readme.md                 Placeholder root README
  documentation.md          This codebase guide
  client/                   React/Vite browser application
  server/                   Express/Mongoose API and background services
```

There is no root `package.json`. Run client commands from `client/` and server commands from `server/`.

### Client package

`client/package.json` defines the browser application. The important scripts are:

- `npm run dev`: starts Vite, normally on port `5173`.
- `npm run build`: creates a production build.
- `npm run lint`: currently aliases `vite build`; it is not a separate lint pass.
- `npm run preview`: serves the production build locally.

The client uses React, React Router, Axios, Bootstrap, Framer Motion, Recharts, React Icons, SweetAlert2, React Hot Toast, jsPDF, and XLSX.

### Server package

`server/package.json` defines the API application. The important scripts are:

- `npm start`: runs `node server.js`.
- `npm run dev`: runs `node --watch server.js`.
- `npm run seed`: runs `seed.js`.

The server uses Express, Mongoose, JWT, bcrypt, Multer, Nodemailer, dotenv, Google Generative AI, and Groq SDK.

## 2. How the Application Starts

### Browser startup

1. `client/index.html` supplies the HTML document, title, font links, and the root element.
2. `client/src/main.jsx` creates the React root.
3. The root is wrapped with `StrictMode`, `BrowserRouter`, `AuthProvider`, and the toast provider.
4. `client/src/App.jsx` selects a page from the current URL.
5. Vite proxies `/api` and `/uploads` to the backend during development according to `client/vite.config.js`.

### Server startup

1. `server/server.js` loads environment variables with dotenv.
2. It creates `server/uploads` when it does not exist.
3. `config/db.js` connects to `MONGO_URI`, or to the local fallback database `ai_interview_db`.
4. Express enables JSON and URL-encoded request bodies.
5. `/uploads` is exposed as a static directory.
6. CORS is enabled.
7. Routers are mounted below `/api`.
8. The health endpoint and global error middleware are registered.
9. The server listens on `PORT`, defaulting to `5001`.

## 3. Configuration and Environment Variables

The server expects environment variables for database, authentication, mail, AI, job-search, and external-location services. The actual secret values should remain private and are not reproduced here.

- `PORT`: API listening port.
- `MONGO_URI`: MongoDB connection string.
- `JWT_SECRET`: signing key for JWTs.
- `CLIENT_URL`: client URL used by some services.
- `EMAIL_USER`, `EMAIL_PASS`: SMTP credentials.
- `SUPPORT_EMAIL`: destination for support requests.
- `CSC_API_KEY`: Country State City API key.
- `AI_PROVIDER`: selected AI provider.
- `AI_API_KEY`: Gemini-style AI key.
- `GROQ_API_KEY`: Groq key.
- `GROQ_MODEL`: Groq model name.
- `OLLAMA_BASE_URL`, `OLLAMA_MODEL`: local Ollama configuration.
- `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD`: optional super-admin seed credentials.

`client/vite.config.js` uses port `5173` and proxies API and upload requests to port `5001`.

## 4. Global Authentication Design

There are two independent login sessions.

### Student session

`AuthContext.jsx` reads `studentUser` and `studentToken` from `localStorage`. On startup, it calls `/auth/me` to validate the token and refresh the user record. Login and registration save the returned user and token. Logout clears student and legacy token keys.

`ProtectedRoute.jsx` waits for that session check. It redirects unauthenticated users to `/login`, permits only the requested roles, redirects admin roles to the super-admin dashboard, and renders the protected page when authorization succeeds.

### Super-admin session

`SuperAdminLogin.jsx` stores `superAdminToken` and `superAdminUser`. `AdminProtectedRoute.jsx` calls `/admin/me`, checks that the returned role is `SUPER_ADMIN`, and redirects to `/super-admin/login` if verification fails.

`services/api.js` adds a bearer token through an Axios request interceptor. URLs containing `/admin` or `/super-admin` use `superAdminToken`; other URLs prefer `studentToken`, then the legacy `token`, then the super-admin token. A 401 response removes the relevant session keys.

## 5. Frontend Routing and Page Responsibilities

All route declarations are in `client/src/App.jsx`.

### Public pages

- `/`: `pages/Home.jsx`, the public landing/home page.
- `/login`: `pages/Login.jsx`, student login form.
- `/register`: `pages/Register.jsx`, student registration and OTP flow.
- `/super-admin/login`: `pages/super-admin/SuperAdminLogin.jsx`, admin login.

### Student pages

Every student route is protected with `ProtectedRoute` and `allowedRoles={['STUDENT']}`.

- `/student/dashboard`: `StudentDashboard.jsx`; combines interview, analytics, and profile-progress summaries.
- `/student/interviews`: `StudentInterviews.jsx`; lists the student’s interview sessions.
- `/student/interviews/:id/questions`: `StudentInterviewQuestions.jsx`; displays a session’s question set.
- `/student/interview-text/:id`: `TextInterview.jsx`; runs a text-based interview.
- `/student/interview-video/:id`: `VideoInterview.jsx`; runs a video/audio interview.
- `/student/result/:id`: `InterviewReport.jsx`; loads and renders the final report.
- `/student/analytics`: `StudentAnalytics.jsx`; displays analytics charts and metrics.
- `/student/profile`: `StudentProfile.jsx`; edits profile fields and uploads a photo.
- `/student/profile-progress`: `ProfileProgress.jsx`; displays weighted profile completion.
- `/student/resume`: `StudentResume.jsx`; uploads, views, updates, and deletes a PDF resume.
- `/student/target-jobs`: `StudentTargetJobs.jsx`; manages target roles and target companies.
- `/student/ats-scanner`: `AtsScanner.jsx`; frontend ATS-scanner page.
- `/student/achievements`: `StudentAchievements.jsx`; displays achievement-related content.
- `/student/placement-opportunities`: `PlacementOpportunities.jsx`; searches matched jobs.
- `/student/help-support`: `HelpSupport.jsx`; creates and reads support messages.
- `/student/ask`: `Ask.jsx`; provides the persistent AI chat experience.
- `/student/interview-preparation/ai-mock`: `AIMockInterviewLevels.jsx`; selects mock-interview level and mode.
- `/student/interview-preparation/ai-mock/setup`: `AIMockInterview.jsx`; configures and creates a mock interview.
- `/student/interview-preparation/quick-practice`: `QuickPractice.jsx`; creates a shorter practice interview.
- `/student/question-bank-reader`: `QuestionBankReader.jsx`; reads the question bank.
- `/student/question-bank`: redirects to the question-bank reader.

### Super-admin pages

All super-admin pages are wrapped in `AdminProtectedRoute` and, for the nested routes, `SuperAdminLayout`.

- `/super-admin/dashboard`: `SuperAdminDashboard.jsx`.
- `/super-admin/students`: `SuperAdminStudents.jsx`.
- `/super-admin/registrations`: `SuperAdminRegistrations.jsx`.
- `/super-admin/resumes`: `SuperAdminResumes.jsx`.
- `/super-admin/target-jobs`: `SuperAdminTargetJobs.jsx`.
- `/super-admin/mock-interviews`: `SuperAdminMockInterviews.jsx`.
- `/super-admin/certificates`: `SuperAdminCertificates.jsx`.
- `/super-admin/users`: `SuperAdminUsers.jsx`.
- `/super-admin/organizations`: `SuperAdminOrganizations.jsx`.
- `/super-admin/jobs-companies`: `SuperAdminJobs.jsx`.
- `/super-admin/ai-interview-engine`: `SuperAdminInterviews.jsx`.
- `/super-admin/resume-scans`: `SuperAdminResumeScans.jsx`.

Unknown URLs redirect to `/`.

## 6. Frontend File-by-File Guide

### Application shell and shared components

- `src/main.jsx`: React entry point; installs router, authentication context, and toast notifications.
- `src/App.jsx`: central route table; connects URL paths to public, student, and admin pages.
- `src/index.css`: global stylesheet; imports Bootstrap and defines colors, typography, cards, gradients, layout, navigation, recorder, and progress styles.
- `src/context/AuthContext.jsx`: owns student session state and exposes `user`, `token`, `loading`, `login`, `register`, `logout`, and `setUser`.
- `src/services/api.js`: shared Axios client, bearer-token selection, and 401 cleanup.
- `src/services/locationService.js`: client-side wrapper for country, state, and city location APIs.
- `src/components/ProtectedRoute.jsx`: student authentication and role gate.
- `src/components/AdminProtectedRoute.jsx`: super-admin token verification and role gate.
- `src/components/StudentLayout.jsx`: student shell containing sidebar, navbar, page content, footer, and AI companion.
- `src/components/SuperAdminLayout.jsx`: admin shell containing admin navigation, header utilities, notifications, health UI, and logout.
- `src/components/Sidebar.jsx`: student navigation links and active navigation styling.
- `src/components/Navbar.jsx`: student top bar, account access, and logout controls.
- `src/components/Footer.jsx`: shared footer.
- `src/pages/super-admin/SuperAdminSidebar.jsx`: super-admin navigation links.
- `src/components/Loading.jsx`: reusable loading indicator.
- `src/components/StatCard.jsx`: reusable metric/statistic display.
- `src/components/ScoreCard.jsx`: score presentation component.
- `src/components/InterviewCard.jsx`: compact interview-session display.
- `src/components/InterviewReportContent.jsx`: report UI for score, evaluation, answers, strengths, weaknesses, and recommendations.
- `src/components/AIChatbot.jsx`: reusable AI chat interface.
- `src/components/student/AICompanion.jsx`: floating entry point for the student AI assistant.
- `src/components/VideoRecorder.jsx`: webcam and microphone handling, MediaRecorder integration, speech-recognition support, audio-level visualization, and recorder methods exposed through `forwardRef`.

### Student page files

- `pages/Home.jsx`: public product home.
- `pages/Login.jsx`: calls the authentication context login method and redirects by role.
- `pages/Register.jsx`: collects registration data, requests/verifies OTP, and submits registration.
- `pages/student/StudentDashboard.jsx`: concurrently loads dashboard analytics, interviews, and profile progress.
- `pages/student/StudentInterviews.jsx`: fetches and presents interview history.
- `pages/student/StudentInterviewQuestions.jsx`: loads questions and answers for a selected interview.
- `pages/student/TextInterview.jsx`: manages text answers, interview timer, start state, and final submission.
- `pages/student/VideoInterview.jsx`: manages camera/microphone interview mode, spoken questions, recording, transcript, timer, and final submission.
- `pages/student/InterviewReport.jsx`: fetches an interview by route parameter and delegates report rendering.
- `pages/student/StudentAnalytics.jsx`: requests student analytics and renders charts/summary values.
- `pages/student/StudentProfile.jsx`: reads and updates profile fields and photo upload.
- `pages/student/ProfileProgress.jsx`: reads profile-progress data and displays completion categories.
- `pages/student/StudentResume.jsx`: manages resume CRUD and PDF viewing/download.
- `pages/student/StudentTargetJobs.jsx`: loads job roles and target jobs, then creates, edits, and deletes target-job records.
- `pages/student/AtsScanner.jsx`: ATS-related user interface; the inspected backend has no dedicated ATS route/controller.
- `pages/student/StudentAchievements.jsx`: achievement display page.
- `pages/student/PlacementOpportunities.jsx`: filters and displays placement results.
- `pages/student/HelpSupport.jsx`: loads support history and submits support requests.
- `pages/student/Ask.jsx`: creates/loads/deletes chats, loads messages, sends messages through SSE, and updates the conversation incrementally.
- `pages/student/QuestionBankReader.jsx`: question-bank browsing and reading interface.
- `pages/student/components/datatableforstudent.jsx`: reusable student table component.
- `pages/student/interview-preparation/AIMockInterviewLevels.jsx`: level and preparation-mode selection before setup.
- `pages/student/interview-preparation/AIMockInterview.jsx`: target-job selection, interview configuration, and interview creation request.
- `pages/student/interview-preparation/QuickPractice.jsx`: quick-practice configuration and creation.

### Super-admin page files

- `pages/super-admin/SuperAdminLogin.jsx`: authenticates a super-admin and stores the separate admin session.
- `SuperAdminDashboard.jsx`: dashboard metrics and health/status summaries.
- `SuperAdminStudents.jsx`: student list and student detail access.
- `SuperAdminRegistrations.jsx`: registration/account listing.
- `SuperAdminResumes.jsx`: administrative resume listing.
- `SuperAdminTargetJobs.jsx`: administrative target-job listing.
- `SuperAdminMockInterviews.jsx`: administrative mock-interview listing.
- `SuperAdminCertificates.jsx`: certificate listing and issue workflow.
- `SuperAdminUsers.jsx`: broad user administration.
- `SuperAdminOrganizations.jsx`: organization administration view.
- `SuperAdminJobs.jsx`: jobs and companies administration view.
- `SuperAdminInterviews.jsx`: AI interview-engine administration view.
- `SuperAdminResumeScans.jsx`: resume-scan administration view.
- `components/DataTable.jsx`: reusable admin data table.
- `components/SuperAdminStudentProfileView.jsx`: detailed student profile view and service-status update UI.

## 7. Backend Request Architecture

A normal request follows this sequence:

```text
Browser page
  -> Axios client in client/src/services/api.js
  -> Vite /api proxy
  -> Express route mounted in server/server.js
  -> authentication/role middleware when required
  -> controller
  -> service and/or Mongoose model
  -> MongoDB or external provider
  -> controller response
  -> React state update and rendered page
```

The route file chooses the URL and middleware. The controller owns request validation and response formatting. Services contain reusable AI, email, job-search, evaluation, or progress logic. Models define MongoDB documents and relationships.

## 8. Backend Route Files

All route paths are mounted below `/api` by `server/server.js`.

### Authentication and profile

`routes/authRoutes.js` defines:

- `POST /auth/send-otp`: public OTP request.
- `POST /auth/verify-otp`: public OTP verification.
- `POST /auth/register`: public account creation.
- `POST /auth/login`: public login.
- `GET /auth/me`: authenticated current-user lookup.
- `PUT /auth/profile`: authenticated profile update.
- `GET /auth/profile-progress`: authenticated progress lookup.
- `POST /auth/upload-photo`: authenticated multipart photo upload.

`routes/profileRoutes.js` provides the profile-progress route under `/profile/progress` as an additional entry point.

### Interview and question routes

`routes/interviewRoutes.js` defines interview creation, listing, detail, deletion, start, answer submission, video answers, full submission, completion, stopping, certificates, and question/answer retrieval. All interview endpoints use student authentication middleware.

`routes/questionRoutes.js` exposes question-bank reading and question creation. Creation is restricted by role middleware to administrator or HR roles.

`routes/aiRoutes.js` exposes authenticated AI question generation.

### Student resource routes

- `routes/resumeRoutes.js`: resume upload, read, update, delete, and PDF streaming.
- `routes/jobRoleRoutes.js`: available job roles.
- `routes/targetJobRoutes.js`: target-job CRUD.
- `routes/placementRoutes.js`: matched job opportunities.
- `routes/analyticsRoutes.js`: student analytics.
- `routes/locationRoutes.js`: countries, states, and cities.
- `routes/supportRoutes.js`: create and list support messages.
- `routes/askRoutes.js`: AI-chat health, chat CRUD, messages, and SSE streaming.
- `routes/notificationRoutes.js`: notification sending endpoints.

### Admin routes

`routes/adminRoutes.js` exposes public admin login and authenticated super-admin endpoints for dashboard, users, organizations, jobs, interviews, resume scans, students, registrations, resumes, target jobs, mock interviews, certificates, student detail, service status, and certificate issuing.

## 9. Backend Middleware

- `middleware/authMiddleware.js`: reads the bearer token, verifies JWT, loads the user without a password, rejects invalid/inactive accounts, and sets `req.user`.
- `middleware/adminMiddleware.js`: verifies an admin JWT and requires role `SUPER_ADMIN`.
- `middleware/roleMiddleware.js`: checks whether the authenticated user has an allowed role.
- `middleware/errorMiddleware.js`: centralizes unhandled Express errors into API responses.

## 10. Backend Controllers by File

- `controllers/authController.js`: OTP lifecycle, registration, login, current-user lookup, profile updates, profile-progress delegation, and profile photo uploads. OTP values are hashed before persistence; passwords use bcrypt; successful authentication returns JWTs.
- `controllers/adminController.js`: super-admin login, admin session, dashboard aggregation, admin resource listings, student detail/status operations, and certificate issuing.
- `controllers/interviewController.js`: interview creation, ownership-aware retrieval paths, lifecycle transitions, individual answer handling, video-answer handling, batch submission, final evaluation, deletion, and certificate access.
- `controllers/questionController.js`: question-bank retrieval and administrative question creation.
- `controllers/analyticsController.js`: aggregates completed interviews, counts, averages, category/mode performance, score trends, strengths, and weaknesses.
- `controllers/resumeController.js`: stores PDF uploads, enforces one-resume behavior per student, returns metadata, updates/deletes records, and streams PDF bytes.
- `controllers/jobRoleController.js`: returns available role records.
- `controllers/targetJobController.js`: creates, reads, updates, and deletes student target jobs.
- `controllers/placementController.js`: gathers target jobs, queries matching job sources, removes duplicates, and returns relevance-sorted opportunities.
- `controllers/locationController.js`: retrieves locations through CSC API and fallback providers and caches results in memory.
- `controllers/askController.js`: creates/reads/deletes user-owned chats, persists messages, builds recent-message context, and streams assistant output via Server-Sent Events.
- `controllers/supportController.js`: persists support requests, sends SMTP email, records email success/failure, and lists the current student’s support history.
- `controllers/notificationController.js`: sends notification email operations and score-based notifications.

## 11. Data Models and Relationships

- `models/User.js`: account identity, email/password, role, active/service state, generated student ID, profile, education, and professional links. A pre-save hook synchronizes duplicate name and phone representations.
- `models/Otp.js`: email, hashed OTP, verification state, and expiration. MongoDB TTL behavior removes expired OTP documents.
- `models/JobRole.js`: role name, category, description, active state, and compatibility name fields.
- `models/Question.js`: question text, category, role, difficulty, mode, source, evaluation criteria, skill, and company.
- `models/TargetJob.js`: a student’s desired role/company/location and related skill data. Its student identifier is stored as a string.
- `models/Interview.js`: interview owner, job/target-job references, target-job snapshot, generated questions, mode, purpose, duration, lifecycle status, score, counters, metrics, and timestamps.
- `models/Answer.js`: answer owner and interview references, text/transcript/media, score, relevance, criteria scores, feedback, strengths, weaknesses, and improvements.
- `models/Evaluation.js`: unique evaluation per interview, overall score, role-specific metrics, strengths, weaknesses, recommendations, summary, and recommendation category.
- `models/Resume.js`: user reference, PDF buffer, PDF metadata, and compatibility student/name fields.
- `models/Certificate.js`: user/interview references, certificate identity, role/category/mode, score, issue date, status, and organization.
- `models/AskChat.js`: user reference, title, last-message timestamp, and recency index.
- `models/AskMessage.js`: chat/user references, `user` or `assistant` role, content, model, completion state, and timestamps.
- `models/SupportMessage.js`: student identity, subject/message, support status, and email status.
- `models/Notification.js`: sender, recipients, email status, aggregate delivery status, and counters. It is defined but not currently persisted by the notification controller.

The primary relationship chain is:

```text
User
  -> TargetJob
  -> Interview
       -> Answer
       -> Evaluation
       -> Certificate
  -> Resume
  -> AskChat -> AskMessage
  -> SupportMessage
```

## 12. Important Backend Services

- `services/aiService.js`: provider abstraction for Gemini, Groq, and Ollama; question generation; question cleanup/deduplication; answer evaluation; follow-up generation; final report generation; and fallback responses.
- `services/aiRetryService.js`: retries rate-limited Groq requests using `Retry-After` or exponential delay.
- `services/askAIService.js`: Ollama chat streaming, cancellation using `AbortController`, and Ollama health checking.
- `services/evaluationService.js`: defines the fixed evaluation criteria: relevance, accuracy, technical knowledge, problem solving, and answer quality.
- `services/emailService.js`: OTP mail, general notifications, score notifications, and development fallback logging when SMTP is unavailable.
- `services/jobSearchService.js`: predefined jobs plus Remotive and Jobicy searches, location/role filtering, skill overlap, and relevance scoring.
- `services/locationService.js` is client-side; the server-side location logic is in `controllers/locationController.js`.
- `services/profileProgressService.js`: calculates weighted profile completion across registration, personal information, education, resume, and professional links.
- `utils/studentIdGenerator.js`: generates IDs in the `STU-YYYY-XXXXX` format by checking existing users.

## 13. Main User Flows

### Registration and login

1. The registration page asks for user details and requests an OTP.
2. The auth controller checks email availability, applies a resend cooldown, hashes and stores the OTP, and sends it through the email service.
3. The browser submits the OTP for verification.
4. Registration requires a verified OTP, hashes the password, creates a forced student account, invalidates OTP records, and returns a JWT.
5. Login validates email/password and account state, then returns a 30-day JWT and normalized user data.
6. The client stores the student session and future Axios requests attach its bearer token.

### Interview creation and completion

1. The setup page loads target jobs and posts an interview configuration.
2. The controller verifies the target job, infers category where necessary, snapshots target-job values, loads recent questions, calls the AI service, cleans/deduplicates results, and creates a pending interview.
3. Text or video interview pages load the interview and start it if still pending.
4. The runner tracks elapsed time. Text mode stores answer text; video mode uses browser media APIs, recording, speech synthesis, and speech recognition.
5. The runner posts all answers to the submit endpoint.
6. The controller saves answers, evaluates real answers in batches of four, assigns zero results to unanswered questions, generates a final report, upserts an evaluation, and marks the interview completed.
7. The report page reloads the completed interview and renders score, metrics, answer feedback, strengths, weaknesses, and recommendations.

### Resume management

The resume page calls `/resume/my-resume`, sends PDF multipart data to create/update endpoints, deletes through the delete endpoint, and opens the PDF stream endpoint. The server stores the PDF buffer inside MongoDB and limits uploads to 16 MB.

### Target jobs and placements

The target-job page loads roles and the current student’s target jobs, then sends CRUD requests. The placement page sends filters to the placement endpoint. The placement controller combines predefined opportunities and external Remotive/Jobicy data, deduplicates them, and sorts by relevance.

### Dashboard, analytics, and profile completion

The dashboard loads analytics, interview history, and profile progress together. Analytics aggregates completed interview results. Profile progress uses weighted categories totaling 100 percent. Profile editing updates account/profile fields and can upload a photo.

### Ask AI chat

The Ask page manages chat records and message history. A message is posted to the SSE endpoint. The controller verifies chat ownership, saves the user message, supplies up to the last 40 messages as context to Ollama, streams assistant chunks, and saves the completed assistant message.

### Support

The support page loads the user’s history and submits a support request. The controller stores it, sends an SMTP message to `SUPPORT_EMAIL`, records whether delivery succeeded, and returns the saved request.

## 14. Seed and Maintenance Files

- `server/seed.js`: clears and reseeds job roles, creates a default student if absent, and inserts sample questions. It does not delete registered users.
- `server/seedSuperAdmin.js`: creates a `SUPER_ADMIN` record when one does not exist, using environment credentials or defaults.
- `server/scratch/checkStudents.js`: diagnostic script that lists student records and IDs.
- `server/scratch/updateStudents.js`: maintenance script for hard-coded student cleanup and student-ID/resume updates.

## 15. Files That Are Configuration or Documentation

- `client/index.html`: browser document and entry module.
- `client/vite.config.js`: Vite plugin, development port, and backend proxies.
- `client/package.json`: frontend dependencies and scripts.
- `server/package.json`: backend dependencies and scripts.
- `server/config/db.js`: database connection setup.
- `readme.md`: currently only placeholder text.
- `documentation.md`: this explanation of the repository.

## 16. Current Behavior Notes and Gaps

These are observations from reading the current code, included to help future debugging and maintenance. They are not changes made by this documentation task.

1. Notification routes are mounted without the same admin protection used by most admin routes; callers may be able to trigger email operations unless another control exists outside the inspected route file.
2. The CORS callback currently accepts non-local origins even though the nearby comment describes localhost-only behavior.
3. Some interview mutation/retrieval paths do not consistently verify that the requested interview belongs to the current student.
4. The interview start path calls `toObject()` before safely handling a missing interview, which can turn a missing record into a server exception.
5. The Groq JSON-mode option is passed in a shape that may not match the Groq service’s expected options object.
6. The admin dashboard health check and AI service use different environment-variable names for Gemini configuration, so displayed health may be inaccurate.
7. The development email fallback logs OTP values even though the authentication comments describe OTPs as not being logged.
8. Some legacy code refers to `student_id` while the current `User` schema uses a different student-ID field, so strict Mongoose behavior may discard such assignments.
9. `TargetJob` uses a string student identifier that may represent either a MongoDB ID or generated student ID.
10. `Notification` has a schema but no observed persistence path in the notification controller.
11. `completeInterview` and `submitFullInterview` are overlapping completion paths.
12. Admin pages that call a URL outside the interceptor’s admin-pattern check may receive the wrong token when both sessions exist.
13. The AI mock level page can navigate to `/student/subscription`, but no such route is declared in `App.jsx`.
14. The ATS scanner page exists, but no dedicated ATS backend route/controller was found during inspection.
15. The server logs a database connection failure but continues starting; protected database-dependent endpoints will then fail later.
16. Resume PDFs are stored in MongoDB and can approach the document-size limit at the configured upload maximum.

## 17. A Practical Reading Order

To understand the project efficiently, read in this order:

1. `client/src/main.jsx` and `client/src/App.jsx` to understand browser startup and routing.
2. `client/src/context/AuthContext.jsx`, `client/src/services/api.js`, and both route guards to understand sessions.
3. `server/server.js` to understand middleware and router mounting.
4. `server/routes/*.js` to map public URLs to middleware and controllers.
5. `server/controllers/authController.js` and `server/middleware/*.js` to understand authorization.
6. `server/models/*.js` to understand persisted data.
7. `server/services/aiService.js`, `evaluationService.js`, and `interviewController.js` to understand the central interview workflow.
8. `AIMockInterview.jsx`, `TextInterview.jsx`, `VideoInterview.jsx`, and `InterviewReportContent.jsx` to connect the browser workflow to the backend.
9. Resume, target-job, placement, analytics, profile, support, and Ask files for secondary workflows.
10. Admin routes/controllers/pages for the management surface.
11. Seed and scratch scripts for initial data and maintenance behavior.

## 18. Important Interpretation

This guide documents responsibilities and logic blocks rather than reproducing every physical source line. The repository contains roughly 45,000 lines including frontend and backend source, so the useful unit for understanding the system is the file, exported function/component, route, model, and end-to-end request flow. For exact behavior, use the linked source files alongside this guide.
