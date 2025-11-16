# Change Detection Dashboard

This project is a dashboard for [ChangeDetection.io](https://changedetection.io) that provides a clean interface to view and manage your website watchers using the ChangeDetection.io API.

It runs as a Node.js application with React as frontend and Express as backend, making live API calls to your ChangeDetection.io instance.

---

## Features

- 📊 **Live Dashboard** - Real-time view of all your watchers
- 📈 **Change History** - View complete history for each watcher
- 🔍 **Diff Viewer** - See what changed between snapshots
- 📸 **Snapshot Viewer** - View historical snapshots
- 🗑️ **Watcher Management** - Delete watchers directly from dashboard
- 🔄 **Manual Triggers** - Trigger checks on-demand (future feature)
- 🔒 **Optional Authentication** - Secure your dashboard with password-based login
- 🚀 **Stateless** - No database needed, all data from ChangeDetection.io API

## Architecture

This dashboard uses a **stateless, API-first architecture**:
- Makes live API calls to ChangeDetection.io
- No local database or data storage
- Direct integration with ChangeDetection.io API
- Real-time data synchronization

## Prerequisites

Ensure you have the following:
- Node.js (>= 20.x)
- A running ChangeDetection.io instance (local or remote)
- API key from your ChangeDetection.io instance ([How to find your API key](https://changedetection.io/docs/api_v1/index.html#section/ChangeDetection.io-Web-page-monitoring-and-notifications-API/Where-to-find-my-API-key))

---

## Configuration

Create a `.env` file in the project root with the following variables:

```bash
# ChangeDetection.io Configuration
CHANGEDETECTION_URL=http://localhost:5000
CHANGEDETECTION_API_KEY=your-api-key-here

# Dashboard Authentication (optional - leave empty to disable)
PASSWORD=your_secure_password

# Session Secret (optional - auto-generated if not set)
SESSION_SECRET=your_session_secret

# Server Port (optional)
PORT=8080
```

---

## Setup

1. Install the required Node.js dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

2. Configure your environment variables (see Configuration section above)

3. Start the development server:
   ```bash
   npm run dev
   ```

## Authentication

The dashboard supports optional password-based authentication:

- **With Authentication**: Set the `PASSWORD` environment variable
  - Users will be redirected to a login page
  - Sessions are valid for 24 hours
  - A logout button appears in the header
  
- **Without Authentication**: Leave `PASSWORD` empty or unset
  - Dashboard is accessible without login
  - No authentication required

---


## Local Publish

```shell
  # Build with author and version information
  docker build --platform linux/amd64 -t changedetection-dashboard .

  # Tag for registry with author namespace
  docker tag changedetection-dashboard 192.168.68.168:3030/changedetection-dashboard:latest

  # Push to registry
  docker push 192.168.68.168:3030/changedetection-dashboard:latest
```

## Local Build and Run
```shell
  docker build --platform linux/amd64 -t changedetection-dashboard . && \
  docker run -p 8080:8080 \
    -e CHANGEDETECTION_URL=http://your-changedetection-host:5000 \
    -e CHANGEDETECTION_API_KEY=your-api-key-here \
    -e PASSWORD=your_secure_password \
    changedetection-dashboard
```

**Note**: The `PASSWORD` environment variable is optional. If not set, the dashboard will run without authentication.

## Using with Docker Compose

You can also use Docker Compose to run both ChangeDetection.io and the dashboard together. Update your `docker-compose.yml`:

```yaml
version: '3'
services:
  changedetection:
    image: ghcr.io/dgtlmoon/changedetection.io
    container_name: changedetection
    ports:
      - "5000:5000"
    volumes:
      - ./changedetection-data:/datastore
    environment:
      - PUID=1000
      - PGID=1000

  dashboard:
    image: changedetection-dashboard
    container_name: changedetection-dashboard
    ports:
      - "8080:8080"
    environment:
      - CHANGEDETECTION_URL=http://changedetection:5000
      - CHANGEDETECTION_API_KEY=your-api-key-here
      - AUTH_USERNAME=admin
      - AUTH_PASSWORD=password
    depends_on:
      - changedetection
```

---

## Troubleshooting

### Cannot connect to ChangeDetection.io
- Verify `CHANGEDETECTION_URL` is correct and accessible
- Check that ChangeDetection.io is running
- Ensure network connectivity between dashboard and ChangeDetection.io

### API Authentication Failed
- Verify `CHANGEDETECTION_API_KEY` is correct
- Check that the API key is still valid in ChangeDetection.io settings
- Ensure API access is enabled in your ChangeDetection.io instance

### No watchers appearing
- Verify watchers exist in ChangeDetection.io
- Check that watchers have been checked at least once
- Review browser console for any API errors

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC

