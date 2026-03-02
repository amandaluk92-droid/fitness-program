# 🎬 Axio - Live Demo Guide

## Quick Start Demo

### Step 1: Setup (First Time Only)

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
# Create .env file with:
# DATABASE_URL="postgresql://user:password@localhost:5432/fitness_app?schema=public"
# NEXTAUTH_URL="http://localhost:3000"
# NEXTAUTH_SECRET="your-secret-key-here"

# 3. Set up database
npx prisma generate
npx prisma migrate dev --name init

# 4. Seed exercises
npm run db:seed

# 5. Create demo data (users, programs, sessions)
npm run db:demo
```

### Step 2: Start the Server

```bash
npm run dev
```

The app will be available at: **http://localhost:3000** (or the port shown in the terminal if 3000 is in use).

---

## 🎯 Demo Walkthrough

### Part 0: Admin Overview (optional, ~3 minutes)

#### 1. Login as Admin
- **URL**: http://localhost:3000/login
- **Email**: `admin@demo.com`
- **Password**: `demo123`

**What you'll see:**
- Prominent 126px Axio logo at top of login page; after login, 90px logo in sidebar
- Redirected to Admin Dashboard at `/admin/dashboard`

#### 2. Admin Dashboard
- **URL**: http://localhost:3000/admin/dashboard

**Features to showcase:**
- **Stats Cards**: Total Users, Trainers, Trainees, Active Subscriptions, Total Revenue
- **Recent Payments**: List of completed payments with user names and amounts

#### 3. Users Page
- **URL**: http://localhost:3000/admin/users

**Features to showcase:**
- Table of all platform users with name, email, role, programs count, subscription status, last payment
- Filter by role (All / Trainers / Trainees)
- "Promote to Admin" button to elevate users to admin role

#### 4. Subscriptions Page
- **URL**: http://localhost:3000/admin/subscriptions

**Features to showcase:**
- Table of subscriptions with trainee, trainer, status, amount, billing interval, dates

#### 5. Payments Page
- **URL**: http://localhost:3000/admin/payments

**Features to showcase:**
- Table of payment records with user, amount, status, description, date

#### 6. Financial Report (Reports)
- **URL**: http://localhost:3000/admin/reports

**Features to showcase:**
- **Table**: Subscription income per trainer with columns: Trainer name, Email, Total charged, Stripe fee (2.9% + 30¢ per transaction), Net remaining
- **Totals row**: Platform-wide totals for charged, Stripe fee, and net
- **Download Excel**: Button to download the report as an .xlsx file
- **Download PDF**: Button to download the report as a PDF

**Demo Points:**
- "Admins get a clear financial view: how much was charged per trainer, what Stripe took in fees, and the net remaining"
- "Reports can be exported to Excel or PDF for accounting or sharing"

#### 7. Settings (Stripe connection)
- **URL**: http://localhost:3000/admin/settings

**Features to showcase:**
- **Stripe connection form**: Admin can connect their own Stripe account by pasting Secret key, Webhook signing secret, and Price IDs for each subscription tier (Starter, Growth, Studio, Pro). Leave a field blank to keep the current value. Links to Stripe Dashboard (API keys, Products).
- **Stripe fees reference**: Static table showing standard Stripe fees—e.g. 2.9% + 30¢ per card transaction, 0.7% Billing for subscriptions, $15 per dispute, no setup/monthly fees—with link to stripe.com/pricing.
- Demo data may prefill placeholder price IDs so the form looks configured; in production the admin enters real keys so trainer subscription buttons redirect to the correct Stripe Checkout page.

**Demo Points:**
- "Admins connect their preferred Stripe account here so all subscription payments go to them"
- "Each tier’s Subscribe button uses the Price ID you set, so links go to the right Stripe product"
- "We surface Stripe’s fee structure so admins know what they’ll pay per transaction"
- "Admins have full platform oversight of all users, subscriptions, and payments; they can promote other users to admin via the Users page"

---

### Part 0b: New Account Sign-up (optional, ~2 minutes)

You can start the demo by showing how simple and stylish sign-up is, or skip to Part 1 with existing credentials.

- **URL**: http://localhost:3000/register

**Features to showcase:**
- **Axio logo** – Prominent 126px logo centered at top for branding
- **Trainer / Trainee cards** – Two side-by-side cards to pick your role (I'm a Trainer / I'm a Trainee). Selected card highlights with primary color.
- **Account name** – Required; how we'll address you in the app.
- **Email** and **Password** – Standard fields with validation (valid email, min 6 characters).
- **Newsletter opt-in** – Optional checkbox: "Send me tips and updates."
- **Privacy & Terms** – Required checkbox with links to Privacy Policy and Terms of Service. Users must accept before creating an account.
- **Privacy & Data Protection page** – Clicking "Privacy Policy" opens our full policy at `/privacy`: standard sections (what we collect, how we use it, data sharing, retention, security, cookies, your rights, contact). Aligned with fitness-app and data-protection expectations (e.g. GDPR-style transparency).
- **Clean card layout** – Light background, white form card with shadow, simple and welcoming for first-timers.

**Try it:**
- Role: Click the "Trainee" card
- Account name: `Demo User`
- Email: `newuser@demo.com`
- Password: `demo123`
- Check "Send me tips and updates" (optional)
- Check "I agree to the Privacy Policy and Terms of Service" (required)
- Click **Create account** → Redirected to login

**Showcase the Privacy and Terms pages (optional):**
- From the sign-up form, click **"Privacy Policy"** (opens in a new tab), or go directly to **http://localhost:3000/privacy**. Scroll through: table of contents, what data we collect, how we use it, no selling of data, user rights, contact. Use this to highlight transparency and trust.
- Click **"Terms of Service"** or go to **http://localhost:3000/terms** to show the full Terms: agreement, service description, health disclaimers, accounts, subscriptions, cancellation, acceptable use, liability, contact. Aligned with common SaaS and fitness-app ToS templates.

**Demo Points:**
- "Sign-up is minimal: role, name, email, password. One click to choose trainer or trainee."
- "We ask for newsletter consent and require agreement to our Privacy Policy and Terms."
- "Our Privacy & Data Protection page is linked at sign-up and covers what we collect, how we use it, and user rights—aligned with common fitness-app and data-protection standards."
- "The design is clean and approachable for first-time users."

---

### Part 1: Trainer Experience (5 minutes)

#### 1. Login as Trainer
- **URL**: http://localhost:3000/login
- **Email**: `trainer@demo.com`
- **Password**: `demo123`

**What you'll see:**
- Prominent 126px Axio logo at top of login page
- Clean login page with email/password fields
- After login, redirected to Trainer Dashboard with 90px Axio logo in sidebar

#### 2. Trainer Dashboard
- **URL**: http://localhost:3000/trainer/dashboard

**Features to showcase:**
- **Stats Cards**: Total Trainees (1), Active Programs (2), Sessions This Week (varies)
- **Recent Activity**: Shows last 5 training sessions logged by trainees
- **Trainee List**: Card showing "Sarah Trainee" with:
  - Active programs count
  - Last session date
  - Click to view details

**Demo Points:**
- "Here's the trainer's command center - they can see all their trainees at a glance"
- "The stats update in real-time as trainees log sessions"
- "Click on a trainee card to see their full profile"

#### 3. View Trainee Details
- Click on "Sarah Trainee" card
- **URL**: http://localhost:3000/trainer/trainees/[trainee-id]

**Features to showcase:**
- **Trainee info**: Name, email, active programs count
- **Personal profile** (only for connected trainees): Phone, age, sex, weight (kg), goals. Shows "—" when not set.
- Assigned programs list
- Recent sessions with dates and notes
- "View Progress" button

**Demo Points:**
- "Trainers only see trainee details once they're connected—that is, once the trainee has at least one program from this trainer."
- "The personal profile is what the trainee entered on their Profile page."
- "Trainers can see all programs assigned to each trainee and track session history and notes."

#### 4. View Trainee Progress
- Click "View Progress" button
- **URL**: http://localhost:3000/trainer/trainees/[trainee-id]/progress

**Features to showcase:**
- **Filters**: Program, Exercise, Weeks, Metric, Chart Type
- **Progress Chart**: Line/Bar chart showing progress over time
- **Week Comparison**: Current vs previous week with trend indicators

**Demo Points:**
- "Trainers can analyze trainee progress with visual charts"
- "Filter by specific exercises to see weight progression"
- "Week-over-week comparison shows improvement trends"
- "Green arrows = improvement, Red = decline"

#### 5. Browse Program Templates
- Go to **Programs** → **Browse Templates**
- **URL**: http://localhost:3000/trainer/programs/templates

**Features to showcase:**
- **Category filter**: GBC (German Body Composition) or Injury Rehab
- **Injury type filter**: When Rehab is selected, filter by ACL, Rotator Cuff, Lower Back, Knee
- **Template cards**: GBC 12-Week (4 workout days), GBC 8-Week (3 workout days), Rotator Cuff Rehab, ACL Rehab, Lower Back Rehab, Knee Rehab
- **Workout day count**: GBC templates show "4 workout days" or "3 workout days" plus exercise count
- **Rehab disclaimer**: Amber banner: "For informational purposes. Trainees should consult a healthcare provider before starting any rehab program."
- **Use template** button on each card

**Demo Points:**
- "We ship with GBC and injury rehab templates so trainers can start quickly"
- "GBC templates have 3–4 distinct workout days each—compound supersets, fat loss and muscle building"
- "Rehab templates cover common injuries; trainers customize before assigning"

**Try it:**
- Filter by "GBC" to show only GBC templates
- Filter by "Rehab" to show injury rehab templates
- Click "Use template" on "GBC 8-Week Fat Loss"

#### 6. Create Program from Template
- After clicking "Use template" on any template
- **URL**: http://localhost:3000/trainer/programs/new?templateId=...

**Features to showcase:**
- Form prefills with template name, description, duration, and exercises grouped by Day 1, Day 2, Day 3, Day 4
- **Multi-day layout**: GBC templates show exercises under "Day 1", "Day 2", etc.; trainer can add or remove exercises per day
- Trainer can modify any field before creating
- Trainee selection is **optional**—can create without assigning, then assign later
- For rehab templates: disclaimer banner on the form
- Submit creates the program and optionally assigns to trainee

**Demo Points:**
- "Form loads with template data—exercises grouped by workout day; edit as needed, then create"
- "Add or remove exercises per day with the per-day Add Exercise button"
- "Assign now or leave unassigned and assign later"
- "Rehab disclaimer reminds trainers to have clients consult a healthcare provider"

**Try creating from template:**
- Use GBC 8-Week Fat Loss
- Optionally change name to "Sarah's Fat Loss Program"
- Pick trainee: Sarah Trainee
- Submit → program appears in list, assigned to Sarah

#### 7. Create New Program (from scratch)
- Go to **Programs** → **New Program**
- **URL**: http://localhost:3000/trainer/programs/new

**Features to showcase:**
- Program form (name, description, duration, trainee selection)
- **Exercise Builder**:
  - Add multiple exercises
  - Set sets, reps, weight, rest time for each
  - Reorder exercises
  - Remove exercises

**Demo Points:**
- "When a trainer assigns a program to a trainee, they become connected. Only then can the trainer see that trainee's profile and details."
- "Trainers can create custom programs for each trainee"
- "Exercise builder allows detailed program design"
- "Each exercise can have different parameters"

**Try creating:**
- Name: "Advanced Strength Program"
- Trainee: Sarah Trainee
- Add 3 exercises:
  - Bench Press: 4 sets, 8 reps, 70kg, 120s rest
  - Squat: 4 sets, 6 reps, 100kg, 180s rest
  - Deadlift: 3 sets, 5 reps, 120kg, 240s rest

#### 8. View All Programs
- **URL**: http://localhost:3000/trainer/programs

**Features to showcase:**
- Grid of program cards
- Each card shows: name, trainee, exercise count, status (Active/Inactive)
- Click any program to view details

---

### Part 2: Trainee Experience (5 minutes)

#### 1. Login as Trainee
- Sign out from trainer account
- **URL**: http://localhost:3000/login
- **Email**: `trainee@demo.com`
- **Password**: `demo123`

**What you'll see:** Prominent 126px Axio logo on login page; 90px logo in sidebar after login

#### 2. Trainee Profile
- Go to **Profile** in the sidebar
- **URL**: http://localhost:3000/trainee/profile

**Features to showcase:**
- **Personal details form**: Name, email (read-only), phone, age, sex, weight (kg), goals (textarea)
- Save updates with success message
- All profile fields optional except name

**Demo Points:**
- "Trainees manage their own profile here. Trainers see this information for connected trainees."
- "They can update phone, age, sex, goals, and weight anytime."

**Try updating:**
- Change weight to 66, add or edit goals, then click "Save profile"

**How to test the profile fix:** Sign in as trainee (trainee@demo.com / demo123), then open **Profile** in the sidebar. The page should load with the personal details form. Edit a field (e.g. weight or goals) and click "Save profile" to confirm updates work. If you ever see a redirect to login on Profile, sign out and sign in again with the trainee credentials.

#### 3. Trainee Dashboard
- **URL**: http://localhost:3000/trainee/dashboard

**Features to showcase:**
- **Stats Cards**: Active Programs (2), Total Sessions (6), Sessions This Week
- **Quick Actions**: "Log New Session" and "View Progress" buttons
- **Active Programs**: Cards showing assigned programs
- **Recent Sessions**: List of last 5 logged sessions

**Demo Points:**
- "Trainees see their personalized dashboard"
- "Quick access to log sessions and view progress"
- "All assigned programs are visible"

#### 4. View Program Details
- Click on any program card
- **URL**: http://localhost:3000/trainee/programs/[program-id]

**Features to showcase:**
- Program name and description
- Complete exercise list with:
  - **Multi-day programs**: Exercises grouped under "Day 1", "Day 2", etc. (for programs created from GBC templates)
  - Sets, reps, target weight
  - Rest time between sets
  - Exercise order

**Demo Points:**
- "Trainees can see their complete program"
- "Multi-day programs show exercises by workout day—Day 1, Day 2, etc."
- "All exercise details are clearly displayed"

#### 5. Log Training Session
- Go to **Sessions** → **Log Session**
- **URL**: http://localhost:3000/trainee/sessions/log

**Features to showcase:**
- Program selector dropdown
- Date picker (defaults to today)
- RPE (Rate of Perceived Exertion) input (1-10)
- Session notes field
- **Exercise Log Cards**: For each exercise in program:
  - Set-by-set input for reps and weight
  - Add/remove sets dynamically
  - Exercise-specific notes
  - Visual set cards

**Demo Points:**
- "Trainees log their actual performance"
- "Can adjust sets on the fly"
- "Track RPE to monitor intensity"
- "Add notes for each exercise and overall session"

**Try logging a session:**
- Select "Beginner Strength Program"
- For Bench Press: 3 sets
  - Set 1: 10 reps @ 65kg
  - Set 2: 10 reps @ 65kg
  - Set 3: 9 reps @ 65kg
- For Squat: 3 sets
  - Set 1: 8 reps @ 85kg
  - Set 2: 8 reps @ 85kg
  - Set 3: 7 reps @ 85kg
- RPE: 8
- Notes: "Great session, felt strong"

#### 6. View All Sessions
- **URL**: http://localhost:3000/trainee/sessions

**Features to showcase:**
- List of all logged sessions
- Each session shows:
  - Program name
  - Date
  - RPE (if logged)
  - Session notes
  - All exercises with sets, reps, weights

**Demo Points:**
- "Complete workout history"
- "Easy to review past sessions"
- "See progression over time"

#### 7. Progress Tracking
- Go to **Progress**
- **URL**: http://localhost:3000/trainee/progress

**Features to showcase:**
- **Filter Panel**:
  - Program filter (All Programs / Specific Program)
  - Exercise filter (All Exercises / Specific Exercise)
  - Weeks selector (4, 8, 12, 16 weeks)
  - Metric selector (Sessions, Volume, Max Weight, Total Reps)
  - Chart type (Line / Bar)

- **Progress Chart**:
  - Interactive Recharts visualization
  - Hover for details
  - Shows selected metric over time

- **Week Comparison Card**:
  - Current week vs previous week
  - Percentage change with trend indicators
  - Green = improvement, Red = decline

**Demo Points:**
- "Visual progress tracking with charts"
- "Filter by specific exercises to see weight progression"
- "Compare weeks to see improvement trends"
- "Multiple metrics: volume, max weight, total reps"

**Try different filters:**
- Select "Beginner Strength Program"
- Select "Bench Press" exercise
- Change metric to "Max Weight"
- See the weight progression over 3 weeks

---

## 🎨 UI/UX Highlights to Mention

### Design
- **Axio branding** – Prominent logo (126px on login/register, 90px in sidebar) across all dashboards and auth pages
- **Modern, clean interface** with blue primary color scheme
- **Responsive design** - works on mobile, tablet, desktop
- **Card-based layout** for easy scanning
- **Intuitive navigation** with role-based sidebars

### User Experience
- **Form validation** - helpful error messages
- **Loading states** - visual feedback during operations
- **Empty states** - helpful messages when no data
- **Quick actions** - prominent buttons for common tasks
- **Privacy & Data Protection** - full policy at `/privacy` (linked from sign-up), with standard sections and user rights

### Data Visualization
- **Interactive charts** with Recharts
- **Color-coded trends** (green = good, red = decline)
- **Flexible filtering** for detailed analysis
- **Week comparisons** for progress tracking

---

## 📊 Demo Data Summary

The demo includes:
- ✅ **1 Admin**: Demo Admin (admin@demo.com)
- ✅ **1 Trainer**: John Trainer (trainer@demo.com)
- ✅ **1 Trainee**: Sarah Trainee (trainee@demo.com) with profile (phone, age, sex, goals, weight) for trainer view
- ✅ **2 Programs**: 
  - Beginner Strength Program (4 weeks, 4 exercises)
  - Upper Body Focus (3 weeks, 2 exercises)
- ✅ **6 Training Sessions**: Spread over 3 weeks with progressive overload
- ✅ **1 Active Subscription**: Sarah → John ($49.99/month)
- ✅ **2 Payment Records**: Sample completed payments for the subscription (used in Financial Report)
- ✅ **Financial Report**: Admin Reports page shows income per trainer, Stripe fee, net; Excel/PDF export
- ✅ **10 Pre-seeded Exercises**: Bench Press, Squat, Deadlift, etc.
- ✅ **6 Program Templates**: GBC 12-Week (4 workout days), GBC 8-Week (3 workout days), Rotator Cuff Rehab, ACL Rehab, Lower Back Rehab, Knee Rehab
- ✅ **Stripe config (demo)**: One row with placeholder Price IDs for Admin Settings showcase; add real keys in production

---

## 🚀 Quick Demo Commands

```bash
# Full setup (first time)
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run db:demo

# Start demo
npm run dev

# Reset demo data (if needed)
npm run db:demo
```

---

## 💡 Key Features to Highlight

1. **Simple, stylish signup**: Trainer/Trainee cards, account name, email, password. Newsletter opt-in and required Privacy/Terms agreement. Full **Privacy & Data Protection** page at `/privacy` (linked from sign-up).
2. **Trainee profile**: Trainees update phone, age, sex, goals, and weight on their Profile page.
3. **Trainer view of profile**: Once connected (via program assignment), trainers see the trainee's personal profile on the trainee detail page.
4. **Role-Based Access**: Trainers and trainees see different interfaces.
5. **Program Management**: Create programs from scratch or from GBC/rehab templates; GBC templates have 3–4 workout days each; customize per day and assign to trainees.
6. **Session Logging**: Comprehensive workout tracking.
7. **Progress Analytics**: Visual charts and week-over-week comparisons.
8. **Trainee Management**: Trainers can view connected trainees and their progress.
9. **Real-time Updates**: Stats update as data is logged.
10. **Admin Stripe settings**: Admins connect their Stripe account (keys, Price IDs) in Settings; subscription buttons then link to the correct Stripe Checkout. Stripe fees reference table is shown for transparency.
11. **Financial Report**: Admins see subscription income per trainer with Stripe fee and net remaining on the Reports page, and can download the report as Excel or PDF.

---

## 🎯 Demo Flow Summary

**Optional start:** Register (role cards, account name, email, password, newsletter opt-in, privacy/terms agreement) → then login.

**Admin Side (optional first):**
1. Login as admin → Dashboard (users, subscriptions, payments overview)
2. Users → View all users, promote to admin
3. Subscriptions → View subscription status
4. Payments → View payment collection records
5. Reports → Financial report: income per trainer, Stripe fee, net; download Excel/PDF
6. Settings → Stripe connection (keys, Price IDs) and Stripe fees reference

**Trainer Side:**
1. Login → Dashboard → View Trainees
2. View Trainee Details (incl. Personal profile) → View Progress
3. Browse Templates → Create from Template (or create from scratch) → View All Programs

**Trainee Side:**
1. Login → Profile (update details) → Dashboard
2. View Programs → Log Training Session → View Sessions
3. View Progress → Filter and Analyze

**Total Demo Time**: ~10–12 minutes

---

Enjoy showcasing Axio! 🏋️‍♂️
