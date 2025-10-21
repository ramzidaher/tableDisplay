# Netlify DB Setup Guide

This guide will help you set up your database using Netlify's new integrated database system powered by Neon.

## 🚀 Automatic Database Setup (Recommended)

Since you have the `@netlify/neon` package installed, Netlify will automatically:
- Create a Neon database instance when you deploy
- Set up the `DATABASE_URL` environment variable automatically
- Handle all database configuration for you

## 1. Deploy Your Changes

Simply push your code to GitHub and Netlify will:
1. Detect the `@netlify/neon` package
2. Automatically create a database instance
3. Set up the connection string
4. Deploy your application

## 2. Claim Your Database (Important!)

After your first deployment, you need to claim your database:

1. Go to your Netlify site dashboard
2. Navigate to **Extensions** → **Neon**
3. Click **Connect Neon** and follow the setup prompts
4. Click **Claim database** to make it permanent

⚠️ **Important**: Unclaimed databases are deleted after 7 days!

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

1. **Database Not Created**: Make sure you've claimed your database in the Netlify UI
2. **Connection Errors**: Check Netlify function logs in the dashboard
3. **Missing Environment Variable**: The `DATABASE_URL` should be set automatically

### Debug Steps:

1. Check Netlify function logs in the dashboard
2. Verify the database is claimed in Extensions → Neon
3. Check that the `@netlify/neon` package is installed

## 7. Local Development

For local development with Netlify DB:

```bash
# Install dependencies
npm install

# Run local development server (will auto-create database)
netlify dev
```

The `netlify dev` command will automatically:
- Create a local database instance
- Set up the `DATABASE_URL` environment variable
- Start your application with database connectivity

## 8. Benefits of Netlify DB

✅ **Automatic Setup**: No manual environment variable configuration  
✅ **Integrated Workflow**: Database created during deployment  
✅ **Production Ready**: Full Neon database features  
✅ **Easy Management**: Manage through Netlify dashboard  
✅ **Cost Effective**: Pay only for what you use
