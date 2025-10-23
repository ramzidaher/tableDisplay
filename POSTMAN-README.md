# IT Office Display API - Postman Collection

## 🚀 **Quick Setup:**

1. **Import the collection** into Postman:
   - File → Import → Select `IT-Office-Display-API.postman_collection.json`

2. **The collection is ready to use** with your Netlify URL pre-configured!

## 📋 **API Endpoints Included:**

### **Notes Management:**
- ✅ **GET** `/api/notes` - Get all notes
- ✅ **GET** `/api/notes/{id}` - Get specific note
- ✅ **POST** `/api/notes` - Create new note
- ✅ **PUT** `/api/notes/{id}` - Update note
- ✅ **DELETE** `/api/notes/{id}` - Delete note
- ✅ **DELETE** `/api/notes` - Clear all notes

### **Working Hours Management:**
- ✅ **GET** `/api/working-hours` - Get all schedules
- ✅ **PUT** `/api/working-hours/{person}` - Update person's schedule
- ✅ **PUT** `/api/working-hours/{person}/{day}` - Update specific day

### **Web Interfaces:**
- ✅ **GET** `/` - Admin interface
- ✅ **GET** `/display` - Display interface

## 🎯 **Example Requests:**

### **Create a Note:**
```json
POST /api/notes
{
  "message": "Meeting at 2 PM today",
  "priority": "high"
}
```

### **Update Working Hours:**
```json
PUT /api/working-hours/tim/monday
{
  "location": "Office",
  "hours": "8:00 AM - 6:00 PM"
}
```

### **Get All Data:**
```json
GET /api/notes
GET /api/working-hours
```

## 🔧 **Environment Variables:**

The collection uses these variables:
- **`base_url`**: `https://profound-malasada-57c01b.netlify.app`

## 📱 **Testing Your Display:**

1. **Add some notes** using the POST requests
2. **Update working hours** for Tim and Ramzi
3. **Visit the display** at `/display` to see the results
4. **Use the admin** at `/` to manage notes

## 🎨 **Priority Levels:**
- `normal` - Green border (default)
- `high` - Red border and background
- `low` - Blue border and background

## 👥 **People:**
- `tim` - Tim's schedule
- `ramzi` - Ramzi's schedule

## 📅 **Days:**
- `monday`, `tuesday`, `wednesday`, `thursday`, `friday`

## 🌐 **Your Live URLs:**
- **Admin**: https://profound-malasada-57c01b.netlify.app/
- **Display**: https://profound-malasada-57c01b.netlify.app/display
- **API**: https://profound-malasada-57c01b.netlify.app/api/

Happy testing! 🚀





