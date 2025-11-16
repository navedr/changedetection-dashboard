# ChangeDetection Dashboard - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Prerequisites
- Node.js 20.x or higher
- A running ChangeDetection.io instance
- Your ChangeDetection.io API key ([Find it here](https://changedetection.io/docs/api_v1/index.html#section/ChangeDetection.io-Web-page-monitoring-and-notifications-API/Where-to-find-my-API-key))

### 2. Clone and Install

```bash
git clone <your-repo-url>
cd changedetection-dashboard
npm install
```

### 3. Configure Environment

Create a `.env` file in the project root:

```bash
# ChangeDetection.io Configuration
CHANGEDETECTION_URL=http://localhost:5000
CHANGEDETECTION_API_KEY=your-api-key-here

# Dashboard Authentication
AUTH_USERNAME=admin
AUTH_PASSWORD=password

# Optional: Server Port (defaults to 8080)
PORT=8080
```

**Important:** Replace the values above with your actual configuration.

### 4. Build and Run

```bash
# Build the application
npm run build

# Start the server
npm start
```

Access the dashboard at: **http://localhost:8080**

---

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

1. Create a `.env` file with your configuration (see above)

2. Run with Docker Compose:

```bash
docker-compose up -d
```

3. Access at: **http://localhost:8080**

### Using Docker Directly

```bash
# Build the image
docker build -t changedetection-dashboard .

# Run the container
docker run -d \
  -p 8080:8080 \
  -e CHANGEDETECTION_URL=http://localhost:5000 \
  -e CHANGEDETECTION_API_KEY=your-api-key \
  -e AUTH_USERNAME=admin \
  -e AUTH_PASSWORD=password \
  --name changedetection-dashboard \
  changedetection-dashboard
```

---

## 📝 Configuration Details

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `CHANGEDETECTION_URL` | Your ChangeDetection.io instance URL | `http://localhost:5000` |
| `CHANGEDETECTION_API_KEY` | API key from ChangeDetection.io | `your-api-key-here` |
| `AUTH_USERNAME` | Dashboard login username | `admin` |
| `AUTH_PASSWORD` | Dashboard login password | `password` |

### Optional Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `8080` |

---

## 🔑 Getting Your API Key

1. Open your ChangeDetection.io instance
2. Go to **Settings** (gear icon in top-right)
3. Scroll down to **API Access**
4. Copy your API key
5. Paste it in your `.env` file as `CHANGEDETECTION_API_KEY`

---

## ✅ Verification

After starting the dashboard:

1. **Login**: Navigate to http://localhost:8080 and login with your credentials
2. **View Watchers**: You should see all your watchers from ChangeDetection.io
3. **Click on a Watcher**: View its change history
4. **View Snapshots**: Click "View Snapshot" to see historical content
5. **View Diffs**: Click "View Diff" to see what changed

---

## 🛠️ Development Mode

For development with hot-reload:

```bash
npm run dev
```

This will:
- Start the frontend on http://localhost:5173 (Vite dev server)
- Start the backend on http://localhost:8080 (with auto-reload)

---

## 📦 Production Build

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm start
```

---

## 🔍 Troubleshooting

### "Failed to connect to ChangeDetection.io"

**Cause:** Dashboard can't reach your ChangeDetection.io instance

**Solutions:**
- Check that `CHANGEDETECTION_URL` is correct
- Ensure ChangeDetection.io is running
- If using Docker, use `host.docker.internal` instead of `localhost`

**Example for Docker:**
```bash
CHANGEDETECTION_URL=http://host.docker.internal:5000
```

### "Invalid API key"

**Cause:** API key is incorrect or not set

**Solutions:**
- Verify your API key in ChangeDetection.io Settings
- Ensure no extra spaces in `.env` file
- Try regenerating the API key

### "Cannot login to dashboard"

**Cause:** Wrong username/password

**Solutions:**
- Check `AUTH_USERNAME` and `AUTH_PASSWORD` in `.env`
- Restart the server after changing `.env`

### "Port already in use"

**Cause:** Port 8080 is already taken

**Solutions:**
- Change `PORT` in `.env` to another port (e.g., `3000`, `8081`)
- Or stop the process using port 8080

---

## 🏗️ Architecture

This dashboard uses an **API-first, stateless architecture**:

```
┌─────────────┐          ┌──────────────┐          ┌─────────────────┐
│   Browser   │◄────────►│  Dashboard   │◄────────►│ ChangeDetection │
│  (React)    │   HTTP   │   (Express)  │   API    │      .io        │
└─────────────┘          └──────────────┘          └─────────────────┘
```

**Key Features:**
- ✅ No local database needed
- ✅ Real-time data from ChangeDetection.io
- ✅ Stateless and easy to scale
- ✅ Simple deployment

---

## 📚 Next Steps

- [Migration Guide](./docs/MIGRATION_COMPLETE.md) - Full migration documentation
- [README](./README.MD) - Detailed project documentation
- [ChangeDetection.io API Docs](https://changedetection.io/docs/api_v1/) - Official API documentation

---

## 🆘 Support

If you encounter issues:

1. Check the [Troubleshooting](#-troubleshooting) section above
2. Review the logs: `docker-compose logs -f` (Docker) or check console output
3. Verify your `.env` configuration
4. Ensure ChangeDetection.io is accessible

---

## 🎉 Success!

You should now have a working ChangeDetection Dashboard! 

Access it at: **http://localhost:8080**

Enjoy monitoring your websites! 🚀

