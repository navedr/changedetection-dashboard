# ChangeDetection.io Dashboard

A web dashboard for viewing and managing webhook data from changedetection.io with SQLite database storage using TypeORM.

## Features

- **Webhook Endpoint**: Receive POST requests from changedetection.io
- **SQLite Database**: Store all change events with TypeORM
- **Watcher List**: View all monitored URLs with change counts
- **Change History**: View detailed history of changes for each watcher
- **Screenshots**: Display screenshots from change detection events
- **Responsive UI**: Bootstrap 5 based interface

## Installation

```bash
# Install dependencies
yarn install
```

## Configuration

The application uses these default settings:

- **Port**: 8080
- **Database**: `changedetection.sqlite` (created automatically in project root)
- **Authentication**: Basic auth (username: `ecarone`, password: `mavericks`)

## Quick Start

1. Install dependencies:
```bash
yarn install
```

2. Copy and configure environment variables:
```bash
cp .env.example .env
# Edit .env to set your credentials
```

3. Start the development server:
```bash
yarn dev
```

4. Open your browser to `http://localhost:8080`
   - Login with credentials from your `.env` file (default: `ecarone` / `mavericks`)

5. Test the webhook (in a new terminal):
```bash
node test-webhook.js
```

6. Refresh the dashboard to see your test data!

## Usage

### Development Mode

```bash
# Start development server (hot reload enabled)
yarn dev
```

This runs both the webpack dev build and the Vite server in watch mode.

### Production Build

```bash
# Build for production
yarn build:ci

# Start production server
yarn start:server
```

## Webhook Configuration

Configure your changedetection.io instance to send webhooks to:

```
POST http://your-domain:8080/api/webhook
```

**Note**: The webhook endpoint does NOT require authentication.

### Example Webhook Payload

changedetection.io will send data in this format:

```json
[
  {
    "headers": { ... },
    "params": {},
    "query": {},
    "body": {
      "version": "1.0",
      "title": "https://example.com/page",
      "message": "**Changes detected**\n...",
      "attachments": [
        {
          "filename": "last-screenshot.png",
          "base64": "...",
          "mimetype": "image/png"
        }
      ],
      "type": "info"
    },
    "webhookUrl": "https://your-url",
    "executionMode": "production"
  }
]
```

## API Endpoints

### Public Endpoints

- `POST /api/webhook` - Receive webhook data from changedetection.io

### Authenticated Endpoints (Basic Auth required)

- `GET /` - Dashboard UI
- `GET /api/watchers` - Get all watchers with stats
- `GET /api/watchers/:id` - Get specific watcher with all changes
- `GET /api/changes/:id` - Get specific change event details

## Database Schema

### Watcher Entity

- `id` - Primary key
- `url` - Monitored URL (unique)
- `title` - Page title
- `watcherId` - UUID from changedetection.io
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### ChangeEvent Entity

- `id` - Primary key
- `watcherId` - Foreign key to Watcher
- `title` - Page title
- `message` - Change description (markdown)
- `diffUrl` - URL to view diff
- `watchUrl` - URL to monitored page
- `editUrl` - URL to edit watcher settings
- `screenshotBase64` - Base64 encoded screenshot
- `screenshotMimetype` - Image MIME type
- `changeType` - Type of change (info, warning, etc.)
- `webhookData` - Raw webhook payload (JSON)
- `createdAt` - Event timestamp

## Tech Stack

- **Backend**: Express.js, TypeORM, better-sqlite3
- **Frontend**: React, TypeScript, Bootstrap 5
- **Build Tools**: Webpack, Vite
- **Database**: SQLite

## Project Structure

```
src/
├── index.ts                    # Express server & API endpoints
├── entities/
│   ├── Watcher.ts             # Watcher entity definition
│   └── ChangeEvent.ts         # ChangeEvent entity definition
├── database/
│   └── data-source.ts         # TypeORM data source configuration
└── components/
    ├── App.tsx                # Main React app component
    ├── WatcherList.tsx        # Watcher list view
    └── ChangeHistory.tsx      # Change history detail view
```

## Development Notes

- The database is automatically created and synchronized on server start
- TypeORM decorators require `experimentalDecorators` and `emitDecoratorMetadata` in tsconfig.json
- Webhook endpoint accepts payloads up to 50MB (for screenshots)
- Basic authentication is applied to all routes except `/api/webhook`

## Testing

### Test with Sample Webhook

A test script is included to send sample webhook data:

```bash
# Make sure the server is running first
yarn dev

# In another terminal, send a test webhook
node test-webhook.js
```

### Test with curl

You can also test with curl:

```bash
curl -X POST http://localhost:8080/api/webhook \
  -H "Content-Type: application/json" \
  -d '[{
    "body": {
      "version": "1.0",
      "title": "https://example.com/test",
      "message": "**Test change detected**",
      "type": "info"
    }
  }]'
```

## Troubleshooting

### Database Issues

If you encounter database issues, delete the `changedetection.sqlite` file and restart the server. The database will be recreated automatically.

### TypeScript Errors

Make sure your tsconfig.json has:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "useDefineForClassFields": false
  }
}
```

## License

ISC

