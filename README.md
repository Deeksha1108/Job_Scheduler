# Persistent Job Scheduler using NestJS + PostgreSQL

This project simulates a real-world scenario just like how platforms such as **Ola, Uber, or Rapido** auto-cancel ride bookings if not confirmed within a few minutes. Instead of using third-party libraries or in-memory schedulers, I built a **persistent job scheduler** using **NestJS**, **PostgreSQL**, and **TypeORM**, which can **survive server crashes or restarts**.

---

## Key Features

- Job scheduler built from scratch (no Bull/Cron library used)
- All jobs and bookings are stored in PostgreSQL (no in-memory loss)
- Scheduler polls the database every 10 seconds to check for due jobs
- Real use case implemented: **Auto-cancel a ride if unconfirmed after 2 minutes**
- Even if server crashes, the pending job runs once the server is back
- **Used CronExpression (EVERY_10_SECONDS)** via `@nestjs/schedule` instead of `setTimeout`/`setInterval`
- Clean modular structure (separate services for jobs, booking, scheduler)
- Used **Winston Logger** for better error tracking
- Used **TypeORM migrations** (instead of unsafe `synchronize: true`)
- Auto-generated **Swagger API documentation** at `/api` for easier testing and visibility

---

## Real-World Use Case

Whenever a user books a ride:

- A booking is created with status `PENDING`
- A job is created that will **auto-cancel** this booking after 2 minutes if not confirmed

The scheduler service keeps checking every 10 seconds — and when the time is up, it checks the booking status and cancels it if still unconfirmed.

This same logic applies to:

- Zomato: unaccepted orders
- Flipkart: cart hold timeout
- Banking apps: auto logout
- Email retry: send failed emails again

---

## Tech Stack

- **NestJS** + **@nestjs/schedule** (for cron-style polling)
- **PostgreSQL** + **TypeORM**
- **Winston Logger**
- **Swagger (OpenAPI)** for API testing
- **date-fns** (for manipulating time)
- **Dotenv** (env config)
- **Postman** (for manual API testing)

---

## Folder Structure

```
src/
├── booking/         # Booking logic (CRUD + auto-cancel)
├── config/          # TypeORM config files
├── jobs/            # Job entity + service
├── logger/          # Winston logger setup
├── scheduler/       # Cron scheduler to process due jobs
├── migrations/      # Auto-generated migrations
├── app.module.ts    # Root module
└── main.ts          # App bootstrap
```

---

## Setup Steps

### 1. Clone the Repo

```bash
git clone https://github.com/Deeksha1108/Job_Scheduler.git
cd job-scheduler
npm install
```

### 2. Create `.env`

```env
PORT=3000
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=admin
DATABASE_NAME=job_scheduler
```

### 3. Run Migrations

```
npx typeorm migration:run -d src/config/data-source.ts
```

### 4. Start Server

```
npm run start:dev
```

### 5. Open Swagger API Docs

```
After starting the server, open your browser and navigate to:

http://localhost:3000/api

```

---

## Test the Flow

### Step 1: Create Booking

```http
POST http://localhost:3000/booking
Content-Type: application/json

{
  "userId": "demo123"
}
```

> This creates a booking and also schedules a cancel job after 2 minutes.

### Step 2: Crash the Server

- Close the terminal OR
- Use `kill -9 <PID>`

### Step 3: Restart Server

```bash
npm run start:dev
```

> The job will still execute and cancel the booking after 2 mins.

Terminal output:

```
[SCHEDULER] Running scheduled job poll...
[BOOKING] Booking cancelled successfully: <booking-id>
[JOB] Job marked completed
```

---

## Internal Working

1. `BookingService` creates a booking with status `PENDING`
2. `JobsService` stores a job in DB with `runAt = now + 2 mins`
3. `SchedulerService` runs every 10s using NestJS's `@Cron()` decorator
4. It fetches due jobs:

   ```sql
   SELECT * FROM jobs WHERE status = 'pending' AND runAt <= NOW();
   ```

5. Each job is processed:
   - Locked to prevent race condition
   - Booking is checked & cancelled if still pending
   - Job is marked as completed

---

## Production-Level Practices

- DB-persisted jobs (no job is lost)
- Retry mechanism (each job gets 3 retry attempts)
- Edge cases handled:
  - What if booking already confirmed/cancelled?
  - What if server is down when job was due?

- TypeORM migrations used instead of schema sync
- Winston logger for clean logs (file + console)
- Generic error messages — secure for production

---

## What I Learned from This Project

- I learned how to break down a real-world backend problem and build a custom scheduler system from scratch using NestJS.
- I understood how persistent job schedulers work and how jobs can be reliably stored and executed later even after app restarts.
- Instead of relying on tools like `setTimeout` or `setInterval`, I used **NestJS CronScheduler** (`@Cron(CronExpression.EVERY_10_SECONDS)`) to build a robust and scalable polling system.
- I ensured jobs survive crashes using **PostgreSQL**.
- I used **TypeORM Migrations** to safely generate tables and structure data for production environments.
- I set up a **Winston Logger** to track success, failures, and crashes clearly.
- I handled edge cases like:
  - What if a booking is already confirmed when cancel job runs?
  - Skip the job execution if the booking has already been confirmed.
  - What happens if job runs late or after a crash?
  - Retry logic if job fails the first time
- I built everything with clean modular architecture — just like real company projects.

## Improvements Based on Mentor's Feedback

Earlier, the job locking logic was split across multiple steps (get and then lock), which could cause race conditions.

- I fixed this by combining both into a single atomic call (getAndLockDueJob), which reduces the chance of two workers picking the same job.

- This makes the flow safe for single worker environments.

Based on mentor feedback, I also acknowledged that multi-worker safety needs more robust locking (like using Redis). I proposed adding Redis-based locking to make it production-grade.

Also, instead of hardcoding the next run interval of recurring jobs (addMinutes(..., 2)), I:

- Fetched the recurringInterval value from the job itself dynamically.

- Ensured it’s stored properly in the DB using a dedicated column, and respected at runtime when rescheduling.

---

## Made By Deeksha

> A fully custom job scheduler project built with real-world thinking, backend crash simulation, database-first persistence, proper logs, and clean code.
