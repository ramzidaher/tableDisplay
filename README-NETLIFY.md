# Deploy to Netlify

## 🚀 **Quick Deployment Steps:**

### **1. Install Netlify CLI (Optional)**
```bash
npm install -g netlify-cli
```

### **2. Deploy via Git (Recommended)**
1. **Push to GitHub/GitLab:**
   ```bash
   git add .
   git commit -m "Add Netlify support"
   git push origin main
   ```

2. **Connect to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect your repository
   - Netlify will auto-detect the settings from `netlify.toml`

### **3. Deploy via Netlify CLI**
```bash
# Build the project
npm install

# Deploy to Netlify
netlify deploy --prod
```

## 📁 **Project Structure for Netlify:**

```
tableDisplay/
├── netlify.toml              # Netlify configuration
├── netlify/
│   └── functions/
│       └── notes.js         # Serverless functions
├── public/                   # Static files
│   ├── index.html           # Admin interface
│   ├── display.html         # Display interface
│   ├── styles.css           # Admin styles
│   ├── display.css          # Display styles
│   ├── script.js            # Admin JavaScript
│   └── display.js           # Display JavaScript
└── package.json
```

## 🔧 **Netlify Configuration:**

The `netlify.toml` file configures:
- **Build settings** - How to build your site
- **Function directory** - Where serverless functions are located
- **Redirects** - API routes to functions
- **Publish directory** - Where static files are served from

## 🌐 **Access Your Deployed Site:**

After deployment, you'll get URLs like:
- **Main site**: `https://your-site-name.netlify.app`
- **Admin interface**: `https://your-site-name.netlify.app/`
- **Display interface**: `https://your-site-name.netlify.app/display`

## 📱 **Features on Netlify:**

✅ **Full functionality** - All API endpoints work
✅ **Serverless backend** - No server management needed
✅ **Auto-scaling** - Handles traffic spikes
✅ **Free tier** - 125,000 function calls/month
✅ **Custom domain** - Add your own domain
✅ **HTTPS** - Automatic SSL certificates

## 🔄 **API Endpoints:**

All your existing API endpoints work:
- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note
- `GET /api/working-hours` - Get working hours
- `PUT /api/working-hours/:person` - Update schedule

## 💡 **Benefits of Netlify:**

- **No server management** - Serverless functions handle everything
- **Global CDN** - Fast loading worldwide
- **Automatic deployments** - Deploy on every git push
- **Free hosting** - Perfect for your use case
- **Easy setup** - Just connect your git repository

## 🚨 **Important Notes:**

- **Data persistence** - Currently uses in-memory storage (resets on function restart)
- **For production** - Consider adding a database (MongoDB, PostgreSQL, etc.)
- **Function limits** - 10-second execution limit per function
- **Cold starts** - First request might be slower

## 🔧 **Local Development:**

```bash
# Install dependencies
npm install

# Run locally with Netlify Dev
netlify dev

# Or run the original Express server
npm start
```

Your display will be available at:
- **Admin**: `http://localhost:8888/`
- **Display**: `http://localhost:8888/display`
