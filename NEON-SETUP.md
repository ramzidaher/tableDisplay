# Neon Database Setup for Netlify

This guide will help you set up your Neon PostgreSQL database with your Netlify deployment.

## 1. Database Connection String

Your Neon database connection string is:
```
postgresql://neondb_owner:npg_v6OD0qVbhWNU@ep-restless-math-aespx8ze-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

## 2. Setting Environment Variables in Netlify

### Option A: Through Netlify Dashboard
1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Add a new environment variable:
   - **Key**: `DATABASE_URL`
   - **Value**: `postgresql://neondb_owner:npg_v6OD0qVbhWNU@ep-restless-math-aespx8ze-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require`

### Option B: Through Netlify CLI
```bash
netlify env:set DATABASE_URL "postgresql://neondb_owner:npg_v6OD0qVbhWNU@ep-restless-math-aespx8ze-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

## 3. Database Schema

The application will automatically create the following tables on first run:

### Notes Table
```sql
CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  priority VARCHAR(20) DEFAULT 'normal'
);
```

### Working Hours Table
```sql
CREATE TABLE working_hours (
  id SERIAL PRIMARY KEY,
  person VARCHAR(50) NOT NULL,
  day VARCHAR(20) NOT NULL,
  location VARCHAR(100),
  hours VARCHAR(50),
  UNIQUE(person, day)
);
```

## 4. Default Data

The application will automatically populate the working hours table with default schedules for Tim and Ramzi if the table is empty.

## 5. Testing the Connection

After deploying to Netlify:

1. Visit your Netlify site
2. Check the browser console for any database connection errors
3. Try creating a note through the admin interface
4. Verify the working hours are displaying correctly

## 6. Troubleshooting

### Common Issues:

1. **Connection Timeout**: Ensure your Neon database is not paused
2. **SSL Errors**: The connection string includes SSL requirements
3. **Environment Variable Not Set**: Double-check the `DATABASE_URL` is set in Netlify

### Debug Steps:

1. Check Netlify function logs in the dashboard
2. Verify the environment variable is set correctly
3. Test the database connection string locally if needed

## 7. Local Development

For local development, create a `.env` file in your project root:
```
DATABASE_URL=postgresql://neondb_owner:npg_v6OD0qVbhWNU@ep-restless-math-aespx8ze-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

Then run:
```bash
npm install
npm start
```

## 8. Security Notes

- The database connection string contains credentials
- Keep this information secure
- Consider rotating credentials periodically
- Monitor database usage in your Neon dashboard
