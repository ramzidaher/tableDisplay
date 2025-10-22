# IT Office Display - Notes & Working Hours Management System

A comprehensive web application for managing and displaying notes and working hours on a vertical table display. Features a beautiful glass effect UI, real-time updates, and full database integration with PostgreSQL. **Deployed on Netlify with serverless functions** for scalable, cost-effective hosting. Perfect for digital signage, office displays, or information management systems.

## 🚀 **Key Technologies**
- **Frontend**: HTML5, CSS3, JavaScript with glassmorphism design
- **Backend**: Node.js with Express (local) / Netlify Functions (production)
- **Database**: PostgreSQL with Neon cloud database
- **Deployment**: Netlify serverless hosting with automatic deployments
- **API**: RESTful API with full CRUD operations

## Features

- 🎨 **Beautiful Glass Effect UI** - Modern glassmorphism design with responsive layout
- 📝 **Real-time Notes Management** - Add, edit, delete notes with priority levels
- 👥 **Working Hours Tracking** - Manage schedules for multiple team members
- 📱 **Responsive Design** - Works on any screen size and orientation
- 🔄 **Auto-refresh** - Updates every 30 seconds for real-time display
- 🎯 **RESTful API** - Full CRUD operations for both notes and working hours
- 🗄️ **Database Integration** - PostgreSQL with Neon cloud database
- ⚡ **Serverless Deployment** - Netlify Functions for scalable hosting
- 🔒 **Secure** - Environment-based configuration and SSL connections

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```

### 3. Open Your Browser
Navigate to: `http://localhost:3000`

## API Endpoints

### Notes Management
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|-------------|
| GET | `/api/notes` | Get all notes | - |
| GET | `/api/notes/:id` | Get specific note by ID | - |
| POST | `/api/notes` | Create a new note | `{"message": "text", "priority": "normal\|high\|low"}` |
| PUT | `/api/notes/:id` | Update a note | `{"message": "text", "priority": "normal\|high\|low"}` |
| DELETE | `/api/notes/:id` | Delete a specific note | - |
| DELETE | `/api/notes` | Clear all notes | - |

### Working Hours Management
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|-------------|
| GET | `/api/working-hours` | Get all working hours | - |
| PUT | `/api/working-hours/:person` | Update person's full schedule | `{"schedule": {"monday": {"location": "Office", "hours": "9:00 AM - 5:00 PM"}}}` |
| PUT | `/api/working-hours/:person/:day` | Update specific day for person | `{"location": "Office", "hours": "9:00 AM - 5:00 PM"}` |

### Web Interfaces
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Admin interface for managing notes |
| GET | `/display` | Display interface for showing notes and working hours |

### Example API Usage

**Create a new note:**
```bash
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"message": "Meeting at 2 PM today", "priority": "high"}'
```

**Get all notes:**
```bash
curl http://localhost:3000/api/notes
```

**Update a note:**
```bash
curl -X PUT http://localhost:3000/api/notes/1 \
  -H "Content-Type: application/json" \
  -d '{"message": "Updated meeting time", "priority": "normal"}'
```

**Delete a note:**
```bash
curl -X DELETE http://localhost:3000/api/notes/1
```

**Get working hours:**
```bash
curl http://localhost:3000/api/working-hours
```

**Update person's schedule:**
```bash
curl -X PUT http://localhost:3000/api/working-hours/tim \
  -H "Content-Type: application/json" \
  -d '{"schedule": {"monday": {"location": "Office", "hours": "9:00 AM - 5:00 PM"}}}'
```

**Update specific day:**
```bash
curl -X PUT http://localhost:3000/api/working-hours/tim/monday \
  -H "Content-Type: application/json" \
  -d '{"location": "Work from Home", "hours": "8:00 AM - 6:00 PM"}'
```

## 🗄️ **Database & Netlify Integration**

This application is designed to work seamlessly with **Netlify serverless functions** and **PostgreSQL database**. The system automatically handles database connections, table creation, and data persistence across both local development and production environments.

### **Netlify Functions Architecture**
- **Serverless Backend**: API endpoints run as Netlify Functions
- **Automatic Scaling**: Functions scale automatically based on demand
- **Zero Server Management**: No server maintenance required
- **Global CDN**: Fast loading worldwide
- **Automatic Deployments**: Deploy on every git push

### **Database Integration**
- **PostgreSQL**: Robust relational database for data persistence
- **Neon Cloud**: Serverless PostgreSQL with automatic scaling
- **Connection Pooling**: Efficient database connections
- **SSL Security**: Encrypted connections in production
- **Auto-initialization**: Tables created automatically on first run

### Database Schema

The application uses PostgreSQL with the following tables:

#### Notes Table
```sql
CREATE TABLE notes (
  id INTEGER PRIMARY KEY,
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  priority VARCHAR(20) DEFAULT 'normal'
);
```

#### Working Hours Table
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

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `NETLIFY_DATABASE_URL` | Netlify database URL (alternative) | No | - |
| `NODE_ENV` | Environment (production/development) | No | development |
| `PORT` | Server port for local development | No | 3000 |

### Database Setup

#### For Local Development
1. Create a `.env` file in the project root:
```bash
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
NODE_ENV=development
```

#### For Netlify Deployment
1. Set environment variables in Netlify dashboard:
   - Go to Site Settings → Environment Variables
   - Add `DATABASE_URL` with your PostgreSQL connection string
   - Example: `postgresql://user:pass@host:port/db?sslmode=require`

#### Neon Database (Recommended)
The application is configured to work with Neon PostgreSQL:

```bash
# Connection string format
postgresql://neondb_owner:password@ep-restless-math-aespx8ze-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

## Usage

### Admin Interface (`/`)
1. **Adding Notes**: Type your message in the input field and click "Add Note" or press Enter
2. **Editing Notes**: Click the "Edit" button on any note to modify it
3. **Deleting Notes**: Click the "Delete" button to remove a note
4. **Clearing All**: Use the "Clear All" button to remove all notes
5. **Priority Levels**: Set note priority (normal, high, low) for visual distinction

### Display Interface (`/display`)
- **Real-time Updates**: Automatically refreshes every 30 seconds
- **Notes Display**: Shows all notes with priority-based styling
- **Working Hours**: Displays team member schedules
- **Responsive Design**: Adapts to any screen size

## Deployment

### Local Development

#### Prerequisites
- Node.js 14+ 
- PostgreSQL database (local or cloud)
- npm or yarn

#### Setup
```bash
# Clone the repository
git clone <repository-url>
cd tableDisplay

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database connection string

# Start the development server
npm start
# or for auto-restart during development
npm run dev
```

#### Access Points
- **Admin Interface**: `http://localhost:3000/`
- **Display Interface**: `http://localhost:3000/display`
- **API Base**: `http://localhost:3000/api/`

### 🚀 **Netlify Deployment** (Recommended)

#### **Why Netlify?**
- **Serverless Functions**: No server management required
- **Automatic Scaling**: Handles traffic spikes automatically
- **Global CDN**: Fast loading worldwide
- **Free Tier**: 125,000 function calls/month
- **Easy Setup**: Connect GitHub repository and deploy
- **Environment Variables**: Secure configuration management

#### Automatic Deployment
1. **Connect Repository**: Link your GitHub/GitLab repository to Netlify
2. **Build Settings**: Netlify will auto-detect settings from `netlify.toml`
3. **Environment Variables**: Set `DATABASE_URL` in Netlify dashboard
4. **Deploy**: Automatic deployment on every git push
5. **Live URL**: Get instant HTTPS URL for your application

#### Manual Deployment
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

#### Netlify Configuration
The `netlify.toml` file configures:
- **Functions Directory**: `netlify/functions/`
- **Publish Directory**: `public/`
- **API Redirects**: Routes API calls to serverless functions
- **Build Settings**: Development and production configurations

### Environment Configuration

#### Required Environment Variables
```bash
# Database connection (choose one)
DATABASE_URL=postgresql://user:pass@host:port/db
NETLIFY_DATABASE_URL=postgresql://user:pass@host:port/db

# Optional
NODE_ENV=production
PORT=3000
```

#### **Database Connection Options**

1. **Neon PostgreSQL** (Recommended for Netlify)
   - ✅ **Free tier available** - Perfect for small to medium projects
   - ✅ **Automatic SSL** - Secure connections out of the box
   - ✅ **Serverless-friendly** - Works perfectly with Netlify Functions
   - ✅ **Auto-scaling** - Scales with your application
   - ✅ **Connection pooling** - Efficient database connections

2. **Local PostgreSQL** (Development only)
   - For local development and testing
   - Requires local database setup
   - Not suitable for production deployment

3. **Other PostgreSQL Providers** (Alternative options)
   - **Supabase** - Open source Firebase alternative
   - **AWS RDS** - Amazon's managed PostgreSQL
   - **Google Cloud SQL** - Google's managed database
   - **Railway** - Simple PostgreSQL hosting

## Customization

### Priority Levels
Notes support three priority levels with visual styling:
- `normal` (default) - Green border
- `high` - Red border and background (urgent)
- `low` - Blue border and background (informational)

### Team Members
Default team members configured:
- `tim` - Tim's schedule
- `ramzi` - Ramzi's schedule

### Working Days
Supported days: `monday`, `tuesday`, `wednesday`, `thursday`, `friday`

### Changing the Port
Set the `PORT` environment variable:
```bash
PORT=8080 npm start
```

## File Structure

```
tableDisplay/
├── server.js                              # Main Express server (local development)
├── package.json                           # Dependencies and scripts
├── netlify.toml                           # Netlify configuration
├── netlify/                               # Netlify Functions (serverless)
│   └── functions/
│       ├── db.js                          # Database connection and queries
│       ├── notes.js                       # Notes API serverless function
│       └── working-hours.js               # Working hours API serverless function
├── public/                                # Static files
│   ├── index.html                         # Admin interface
│   ├── display.html                       # Display interface
│   ├── styles.css                        # Admin interface styles
│   ├── display.css                        # Display interface styles
│   ├── script.js                         # Admin interface JavaScript
│   └── display.js                         # Display interface JavaScript
├── NEON-SETUP.md                          # Database setup guide
├── POSTMAN-README.md                      # API testing guide
├── README-NETLIFY.md                      # Netlify deployment guide
├── IT-Office-Display-API.postman_collection.json  # Postman collection
└── README.md                              # This file
```

## Development

### Local Development
For development with auto-restart:
```bash
npm run dev
```

### Testing API Endpoints
Use the included Postman collection:
1. Import `IT-Office-Display-API.postman_collection.json` into Postman
2. Update the `base_url` variable to your deployment URL
3. Test all endpoints with sample data

### Database Testing
```bash
# Test database connection
node -e "require('./netlify/functions/db').initializeDatabase().then(() => console.log('DB connected')).catch(console.error)"
```

## Troubleshooting

### Common Issues

#### Database Connection Errors
- **Error**: "No database URL environment variable found"
  - **Solution**: Set `DATABASE_URL` or `NETLIFY_DATABASE_URL` environment variable

#### SSL Connection Issues
- **Error**: SSL connection failed
  - **Solution**: Ensure connection string includes `?sslmode=require`

#### Netlify Function Timeouts
- **Error**: Function execution timeout
  - **Solution**: Check function logs, ensure database is not paused

#### CORS Issues
- **Error**: CORS policy errors
  - **Solution**: API includes CORS headers, check browser console for specific errors

### Debug Steps
1. Check environment variables are set correctly
2. Verify database connection string format
3. Test API endpoints individually
4. Check Netlify function logs in dashboard
5. Verify database is not paused (for Neon)

## Requirements

- **Node.js**: 14+ 
- **Database**: PostgreSQL (Neon recommended)
- **Package Manager**: npm or yarn
- **Deployment**: Netlify (for serverless) or any Node.js hosting

## Browser Support

- **Chrome**: 60+
- **Firefox**: 55+
- **Safari**: 12+
- **Edge**: 79+
- **Mobile**: iOS Safari 12+, Chrome Mobile 60+

## Additional Resources

- **Database Setup**: See `NEON-SETUP.md` for detailed database configuration
- **API Testing**: See `POSTMAN-README.md` for API testing guide
- **Netlify Deployment**: See `README-NETLIFY.md` for deployment instructions
- **Postman Collection**: Import `IT-Office-Display-API.postman_collection.json` for API testing

## License

MIT License - Feel free to use this project for your digital displays and office management needs!
