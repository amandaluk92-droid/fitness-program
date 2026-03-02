# Axio – Demo Script

One-page script for showing the app. Full walkthrough: see [DEMO.md](DEMO.md).

---

## Before the demo (first time only)

```bash
npm install
# Add .env with DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET

npx prisma generate
npx prisma migrate dev --name init
npm run demo:setup
```

## Start the demo

```bash
npm run demo
```

Open **http://localhost:3001** (or the port shown in the terminal).

If the server fails with "address already in use", free port 3001: run `lsof -i :3001`, then `kill <PID>`, and run `npm run demo` again.

---

## Credentials

| Role    | Email             | Password |
|---------|-------------------|----------|
| Admin   | admin@demo.com    | demo123  |
| Trainer | trainer@demo.com  | demo123  |
| Trainee | trainee@demo.com  | demo123  |

New users can register at **/register** with role cards (Trainer/Trainee), account name, email, password, newsletter opt-in, and Privacy/Terms agreement.

---

## Sign-up showcase (~1–2 min)

1. Go to **/register** (or click "Sign up" from login).
2. **Axio logo**: Prominent 126px logo centered at top for branding.
3. **Role cards**: Show Trainer vs Trainee selection; click one to highlight.
4. **Legal pages**: Click **"Privacy Policy"** or **"Terms of Service"** (open in new tab) to show `/privacy` (data protection, rights) and `/terms` (agreement, health disclaimers, subscriptions, liability). Then return to sign-up.
5. Fill: Account name, email (e.g. `newuser@demo.com`), password (e.g. `demo123`).
6. Newsletter checkbox (optional) and Privacy/Terms checkbox (required).
7. Submit → Redirected to login. Sign in with the new account.

---

## Admin flow (~3 min)

1. **Login** as admin (prominent Axio logo on login page, 90px in sidebar) → Admin Dashboard.
2. **Dashboard** → Overview cards: total users, trainers, trainees, active subscriptions, total revenue; recent payments.
3. **Users** → Table of all users with role, programs, subscription status, last payment. Filter by role. Use "Promote to Admin" to elevate a user.
4. **Subscriptions** → Table of subscriptions (trainee, trainer, status, amount, interval).
5. **Payments** → Table of payment records (user, amount, status, description, date).
6. **Reports** → Financial report: income per trainer (Total charged, Stripe fee, Net remaining). Use **Download Excel** and **Download PDF** to export.
7. **Settings** → Stripe connection: form to connect the admin’s Stripe account (secret key, webhook secret, Price IDs for Starter/Growth/Studio/Pro). Show the **Stripe fees** reference table (2.9% + 30¢, Billing 0.7%, disputes $15, etc.). Demo data may show placeholder price IDs; in production the admin enters real keys so subscription buttons link to the correct Stripe Checkout.

---

## Trainer flow (~5 min)

1. **Login** as trainer (prominent Axio logo on login page, 90px in sidebar) → Dashboard with trainee count, active programs, recent sessions.
2. **Trainees** → Click “Sarah Trainee” → See personal profile (phone, age, sex, weight, goals), assigned programs, recent sessions.
3. **View Progress** → Filters (program, exercise, weeks), chart, week comparison (green/red trends).
4. **Programs** → List of programmes. Click one to see details (exercises, sets, reps).
5. **Browse Templates** → Click "Browse Templates". Filter by GBC or Rehab. Show GBC 12-Week (4 workout days), GBC 8-Week (3 workout days), Rotator Cuff Rehab, ACL Rehab, Lower Back Rehab, Knee Rehab. Note the rehab disclaimer.
6. **Create from Template** → Click "Use template" on GBC 8-Week Fat Loss. Form prefills with Day 1, Day 2, Day 3 sections. Modify name or exercises per day if desired. Optionally pick trainee. Submit → program created and optionally assigned.
7. **New Program** → Or create from scratch: name, pick trainee, add exercises (sets, reps, weight, rest). Submit. (Assigning a program connects trainer and trainee.) Show programmes list again.

---

## Trainee flow (~5 min)

1. **Logout**, then **login** as trainee (prominent Axio logo on login page, 90px in sidebar) → Dashboard with active programmes and quick actions.
2. **Profile** → Open Profile in sidebar; confirm the page loads and the form shows. Update phone, age, sex, weight, or goals and click "Save profile" to test. (Trainers see this for connected trainees.) If Profile ever redirects to login, sign in again as trainee.
3. **Programs** → Click a programme → Show exercise list (grouped by Day 1, Day 2, etc. for multi-day programs; sets, reps, weight, rest).
4. **Sessions → Log Session** → Pick programme, date, RPE, notes. Fill sets/reps/weight per exercise. Submit.
5. **Sessions** → List of past sessions with details.
6. **Progress** → Filters, chart, week comparison. Change metric (e.g. Max Weight) and exercise to show progression.

---

## Talking points

- **Signup** is minimal: pick Trainer or Trainee, enter name, email, password. Newsletter opt-in and required Privacy/Terms agreement. Clean card layout for first-timers. **Privacy & Data Protection** at `/privacy` and full **Terms of Service** at `/terms` are linked from sign-up (standard sections, health disclaimers, liability).
- **Trainees** update their profile (phone, age, sex, goals, weight); **trainers** see it for connected trainees.
- **Connection**: trainer and trainee are connected when the trainer assigns a programme to that trainee.
- **Trainers** create programmes for trainees and see progress with charts and week-over-week comparison.
- **Trainees** see assigned programmes, log sessions (sets, reps, weight, RPE), and track progress.
- **Templates**: GBC templates have 3–4 workout days each (Day 1, Day 2, etc.); rehab templates are single-session. Trainers browse, apply, customize per day, and assign. Rehab templates include a healthcare-provider disclaimer.

---

**Detailed steps and troubleshooting:** [DEMO.md](DEMO.md)
