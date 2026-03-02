# Fitness Program App - Setup Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or remote)
- npm or yarn package manager

## Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/fitness_app?schema=public"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
   ```
   
   Generate a secure `NEXTAUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```

   **Deploy without payments:** To launch the platform without Stripe (trainers can add trainees freely), add:
   ```env
   DISABLE_PAYMENTS=true
   ```
   Remove or set to `false` when you're ready to enable subscription payments.

   **Stripe (for trainer subscriptions):** Optional when payments are enabled. Add these to enable checkout:
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   STRIPE_PRICE_STARTER=price_...
   STRIPE_PRICE_GROWTH=price_...
   STRIPE_PRICE_STUDIO=price_...
   STRIPE_PRICE_PRO=price_...
   ```
   Create products/prices in Stripe Dashboard and configure the webhook endpoint at `/api/stripe/webhook`.

3. **Set Up Database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate dev --name init
   
   # Seed initial exercises
   npm run db:seed
   ```
   Demo data (including sample programmes) is optional; trainers can create their own programmes from scratch after seeding exercises.

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open Application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Initial Setup

1. **Create Accounts**
   - Register as a Trainer
   - Register as a Trainee (or multiple trainees for testing)

2. **Create Exercises** (if needed)
   - Exercises are seeded automatically
   - Additional exercises can be created via API or database

3. **Create Training Programs**
   - As a trainer, go to Programs → New Program
   - Select a trainee
   - Add exercises with sets, reps, weight, and rest time

4. **Log Training Sessions**
   - As a trainee, go to Sessions → Log Session
   - Select program and log your workout

## Features Implemented

### Trainer Features
- ✅ Dashboard with trainee overview and stats
- ✅ Subscription plans (Starter, Growth, Studio, Pro) with trainee limits
- ✅ Create and manage training programs
- ✅ Exercise builder with sets, reps, weight, rest time
- ✅ Trainee management and assignment
- ✅ View trainee progress with charts
- ✅ Week-over-week progress comparison

### Trainee Features
- ✅ Dashboard with active programs and stats
- ✅ View assigned training programs
- ✅ Log training sessions with detailed exercise data
- ✅ Track progress with visual charts
- ✅ Week-over-week performance comparison
- ✅ Filter progress by program, exercise, and time period

### Technical Features
- ✅ Authentication with NextAuth.js
- ✅ Role-based access control
- ✅ Protected routes
- ✅ Responsive design
- ✅ Form validation
- ✅ Error handling
- ✅ Loading states
- ✅ Data visualization with Recharts

## Database Schema

- **User**: Trainers and trainees with role-based access
- **TrainingProgram**: Programs created by trainers
- **Exercise**: Exercise definitions
- **ProgramExercise**: Exercises within programs
- **TrainingSession**: Logged workout sessions
- **SessionExercise**: Exercise data for each session

## API Routes

- `/api/auth/[...nextauth]` - Authentication
- `/api/auth/register` - User registration
- `/api/programs` - Program CRUD
- `/api/exercises` - Exercise CRUD
- `/api/sessions` - Session logging
- `/api/trainees` - Trainee management
- `/api/progress` - Progress tracking data

## Project Structure

```
/app
  /api - API routes
  /(auth) - Authentication pages
  /trainer - Trainer-specific pages
  /trainee - Trainee-specific pages
/components
  /auth - Authentication components
  /trainer - Trainer components
  /trainee - Trainee components
  /shared - Shared UI components
/lib - Utilities and configurations
/prisma - Database schema and migrations
/types - TypeScript type definitions
```

## Next Steps

1. Set up your PostgreSQL database
2. Configure environment variables
3. Run migrations and seed data
4. Create user accounts
5. Start creating programs and logging sessions!

## Troubleshooting

- **Database connection issues**: Check your DATABASE_URL in `.env`
- **Authentication errors**: Verify NEXTAUTH_SECRET is set
- **Build errors**: Run `npx prisma generate` to regenerate Prisma client
- **Missing exercises**: Run `npm run db:seed` to populate exercises
