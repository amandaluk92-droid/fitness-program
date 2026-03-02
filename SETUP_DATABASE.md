# Database Setup Instructions

## Current Status
✅ Prisma Client generated
❌ Database connection failed

## Next Steps

### Option 1: If PostgreSQL is installed but not running

**macOS (using Homebrew):**
```bash
brew services start postgresql@14
# or
brew services start postgresql@15
```

**Linux:**
```bash
sudo systemctl start postgresql
# or
sudo service postgresql start
```

### Option 2: Create the database

Once PostgreSQL is running, create the database:

```bash
# Connect to PostgreSQL
psql postgres

# Create database
CREATE DATABASE fitness_app;

# Exit
\q
```

### Option 3: Update .env with correct credentials

If your PostgreSQL uses different credentials, update `.env`:

```env
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/fitness_app?schema=public"
```

Common defaults:
- User: `postgres`
- Password: `postgres` or empty (check your setup)
- Port: `5432`

### Option 4: Use a cloud database

You can use services like:
- Supabase (free tier available)
- Railway
- Neon
- AWS RDS

Update `.env` with the connection string provided by the service.

## After Database is Ready

Run these commands:

```bash
# Run migrations
npx prisma migrate dev --name init

# Seed exercises
npm run db:seed

# Create demo data
npm run db:demo

# Start server
npm run dev
```

## Quick Test

Test your database connection:

```bash
psql "postgresql://postgres:postgres@localhost:5432/fitness_app" -c "SELECT 1;"
```

If this works, your database is ready!
