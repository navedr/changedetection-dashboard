# Quick Start Guide

## Step 1: Get Your API Key

1. Open your ChangeDetection.io instance in a browser
2. Navigate to **Settings** (gear icon)
3. Scroll to the **API Access** section
4. Copy your API key

If you don't see an API key, you may need to generate one first.

## Step 2: Configure Environment

Create a `.env` file in the project root:

```bash
CHANGEDETECTION_URL=http://localhost:5000
CHANGEDETECTION_API_KEY=paste-your-api-key-here
AUTH_USERNAME=admin
AUTH_PASSWORD=password
PORT=8080
```

Replace:
- `http://localhost:5000` with your ChangeDetection.io URL
- `paste-your-api-key-here` with your actual API key
- `admin` and `password` with your desired credentials

## Step 3: Install Dependencies

```bash
npm install --legacy-peer-deps
```

## Step 4: Start the Dashboard

### Development Mode
```bash
npm run dev
```

The dashboard will start on `http://localhost:8080` (or your configured PORT).

### Production Build
```bash
# Build
npm run build:ci

# Start
npm run start:server
```

## Step 5: Access the Dashboard

1. Open your browser to `http://localhost:8080`
2. Enter your username and password (from AUTH_USERNAME and AUTH_PASSWORD)
3. You should see all your watchers from ChangeDetection.io

## Using Docker

### Quick Run
```bash
docker build -t changedetection-dashboard .

docker run -p 8080:8080 \
  -e CHANGEDETECTION_URL=http://localhost:5000 \
  -e CHANGEDETECTION_API_KEY=your-api-key \
  -e AUTH_USERNAME=admin \
  -e AUTH_PASSWORD=password \
  changedetection-dashboard
```

### With Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3'

services:
  changedetection:
    image: ghcr.io/dgtlmoon/changedetection.io
    ports:
      - "5000:5000"
    volumes:
      - changedetection-data:/datastore
    restart: unless-stopped

  dashboard:
    build: .
    ports:
      - "8080:8080"
    environment:
      - CHANGEDETECTION_URL=http://changedetection:5000
      - CHANGEDETECTION_API_KEY=${CHANGEDETECTION_API_KEY}
      - AUTH_USERNAME=admin
      - AUTH_PASSWORD=password
    depends_on:
      - changedetection
    restart: unless-stopped

volumes:
  changedetection-data:
```

Then run:
```bash
export CHANGEDETECTION_API_KEY=your-api-key-here
docker-compose up -d
```

## Verifying It Works

1. **Check Connection**
   - Open `http://localhost:8080`
   - You should be prompted for login

2. **View Watchers**
   - After login, you should see your watchers list
   - If empty, add watchers in ChangeDetection.io first

3. **View History**
   - Click on any watcher
   - You should see the change history
   - Click "View Snapshot" or "View Diff" to see details

## Common Issues

### "Cannot connect to API"
- Check that `CHANGEDETECTION_URL` is correct
- Ensure ChangeDetection.io is running and accessible
- If using Docker, make sure containers can communicate

### "Authentication failed"
- Verify your API key is correct
- Check that the API key hasn't expired
- Ensure API access is enabled in ChangeDetection.io

### "No watchers showing"
- Verify watchers exist in ChangeDetection.io
- Ensure at least one check has been performed
- Check browser console for error messages

### Port already in use
- Change `PORT` in `.env` to a different port
- Or stop the service using port 8080

## Next Steps

- Configure additional watchers in ChangeDetection.io
- Set up automatic checks/schedules in ChangeDetection.io
- Explore the change history and diff viewer
- Set up production deployment (see README.MD)

## Need Help?

- Check the [API Migration Guide](./API_MIGRATION.md)
- Review [ChangeDetection.io API Documentation](https://changedetection.io/docs/api_v1/)
- Open an issue on GitHub

