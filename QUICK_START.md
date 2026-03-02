# 🚀 Quick Start - Run the Demo

## Prerequisites Check

Before starting, make sure you have:
- ✅ Node.js 18+ installed
- ✅ PostgreSQL database running
- ✅ Database connection details

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Environment File

Create a `.env` file in the root directory:

```bash
# Copy this template and fill in your values
cat > .env << EOF
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/fitness_app?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
EOF
```

**Or manually create `.env` with:**
```env
DATABASE_URL="postgresql://your_user:your_password@localhost:5432/fitness_app?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret-key-here"
```

### 3. Set Up Database

```bash
# Generate Prisma client
npx prisma generate

# Create database (if it doesn't exist)
# For PostgreSQL: createdb fitness_app

# Run migrations
npx prisma migrate dev --name init
```

### 4. Seed Data

```bash
# Seed exercises (required for creating programmes)
npm run db:seed

# Optional: Create demo users, sample programmes, and sessions
npm run db:demo
```
Demo data is optional; trainers can create their own programmes without running `db:demo`.

### 5. Start Development Server

```bash
npm run dev
```

### 6. Open the App

Navigate to: **http://localhost:3000** (or the port shown in the terminal).

---

## 🎯 Demo Credentials

After running `npm run db:demo`, use these credentials:

**Admin Account:**
- Email: `admin@demo.com`
- Password: `demo123`

**Trainer Account:**
- Email: `trainer@demo.com`
- Password: `demo123`

**Trainee Account:**
- Email: `trainee@demo.com`
- Password: `demo123`

---

## 📋 What's Included in Demo Data

- ✅ 1 Admin account (Demo Admin)
- ✅ 1 Trainer account (John Trainer)
- ✅ 1 Trainee account (Sarah Trainee)
- ✅ 2 Training Programs:
  - Beginner Strength Program (4 exercises, 4 weeks)
  - Upper Body Focus (2 exercises, 3 weeks)
- ✅ 6 Training Sessions (spread over 3 weeks with progressive overload)
- ✅ 1 Active Subscription (Sarah → John, $49.99/month)
- ✅ 2 Payment Records
- ✅ 10 Pre-seeded Exercises

---

## 🎬 Demo Flow

1. **Sign up** (optional) → /register → Role cards, name, email, password, newsletter & Privacy/Terms (link to /privacy for full Privacy & Data Protection) → Create account
2. **Login as Admin** (optional) → Admin Dashboard → View all users, subscriptions, payments
3. **Login as Trainer** → View dashboard → See trainee stats
4. **View Trainee** → Click on trainee card → See their programs
5. **View Progress** → Click "View Progress" → See charts and analytics
6. **Create Program** → Go to Programs → Create new program with exercises
7. **Login as Trainee** → View dashboard → See assigned programs
8. **Log Session** → Go to Sessions → Log a workout with sets/reps/weights
9. **View Progress** → See charts showing progress over time

---

## 🐛 Troubleshooting

**Database Connection Error:**
- Check your `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Verify database exists: `psql -l | grep fitness_app`

**Prisma Errors:**
- Run `npx prisma generate` to regenerate client
- Check database connection
- Verify migrations ran: `npx prisma migrate status`

**Port Already in Use:**
- Change port: `npm run dev -- -p 3001` (if 3000 is in use)
- Or free port 3000 and run `npm run dev` to use the default

**Missing Dependencies:**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

**Trainee Profile redirects to login or shows an error:**
- Sign out, then sign in again as trainee (trainee@demo.com / demo123). The app now supports both session id and email for the profile lookup; a fresh login ensures the profile page loads.

---

## 📚 Full Documentation

- See `DEMO.md` for detailed demo walkthrough
- See `SETUP.md` for complete setup guide
- See `README.md` for project overview

---

**Ready to demo! 🎉**
