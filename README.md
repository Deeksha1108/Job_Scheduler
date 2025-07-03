# Persistent Job Scheduler (NestJS + PostgreSQL)

A custom-built persistent job scheduler built using **NestJS** and **PostgreSQL**, inspired by real-world use cases like **auto-cancel bookings in Ola/Uber/Rapido**. The system ensures that even if the server crashes, scheduled jobs will still execute after restart.

---

## Features Implemented

- Custom job scheduler using NestJS (no external scheduler libraries used)
- PostgreSQL used to persist jobs and bookings
- Polling mechanism to check for due jobs every 10 seconds
- Job persists even after server crash or restart
- Real-world use case: auto-cancel ride booking if not confirmed within 2 minutes
- Clean modular folder structure with TypeORM
- Fully tested with crash + restart simulation

---

## Tech Stack

- **Node.js** + **NestJS**
- **PostgreSQL**
- **TypeORM**
- **Dotenv** for environment config
- **Postman** for API testing

---

## Folder Structure

```
src/
├── booking/         # Handles bookings (controller, service, entity)
├── jobs/            # Job logic and job entity
├── scheduler/       # Polling service to run due jobs
├── database/        # TypeORM DB configuration
└── main.ts          # Application bootstrap
```

---

## Setup Instructions

### 1. Clone and install dependencies

```bash
git clone <https://github.com/Deeksha1108/Job_Scheduler.git>
cd job-scheduler
npm install
```

### 2. Configure `.env`

```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=admin
DATABASE_NAME=job_scheduler
```

### 3. Start the server

```bash
npm run start:dev
```

---

## Testing the Flow

### Step 1: Create a Booking

Use Postman:

```http
POST http://localhost:3000/booking
Content-Type: application/json

{
  "userId": "deek123"
}
```

This creates a booking with status `pending` and schedules a cancel job after 2 minutes.

### Step 2: Crash the Server

- After booking is created, simulate a crash:
  - Option 1: Close VSCode terminal using the trash X button or delete icon button
  - Option 2: Use `kill -9 <PID>` to force kill process

### Step 3: Restart the Server

```bash
npm run start:dev
```

- After 2 minutes from booking creation, terminal should show:

```
Running job to cancel booking: <booking-id>
Booking <booking-id> cancelled & job marked done
```

---

## How It Works

- Bookings are created with status `pending`
- A job is inserted in the `jobs` table with `runAt = now + 2 mins`
- `SchedulerService` polls every 10s to find jobs with:

```sql
status = 'pending' AND runAt <= NOW()
```

- If found, the booking is auto-cancelled and job marked as `completed`

---

## Real-World Use Case Implemented

Auto-cancel ride bookings like in:

- Ola
- Uber
- Rapido
- Zomato delivery assignments

---

## Final Result

- Jobs are persisted in PostgreSQL
- Server crash simulated successfully
- Jobs executed even after server restart
- Fully custom implementation

---

## What I Learned from This Assignment

- This assignment helped me understand how to plan and build a solution step by step, just like it’s done in real-world projects.

- I learned how a persistent job scheduler works - where jobs can still run even if the server crashes and restarts later. This made me realize how important reliability is in backend systems.

- I didn’t use any ready-made libraries. Instead, I built my own logic that keeps checking the database every few seconds to find and run pending jobs. It helped me understand how background workers actually work behind the scenes.

- I used PostgreSQL to save both bookings and jobs. By using database timestamps, I could schedule jobs to run at a specific time later, without any external cron tools.

- For the real-life example, I chose the use case of auto-cancelling ride bookings like Ola, Uber, Rapido - where if a ride is not confirmed in time, it's automatically cancelled after a fixed period.

- This concept is also used in many other places:

  Food delivery apps (like Zomato/Swiggy) to auto-cancel unaccepted orders.
  E-commerce platforms (like Amazon) for flash-sale timeout cart releases.
  Banking apps for session expiry or auto-logouts.
  Reminder systems that send alerts after fixed durations.
  Email services that retry sending failed emails.

- I also faced challenges like how to test crash and restart scenarios properly and also I Fixed it.

## Made By

> Deeksha — with complete custom logic, testing, and real-world simulation based on mentor's task.
