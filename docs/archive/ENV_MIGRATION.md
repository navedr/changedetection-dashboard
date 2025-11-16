# Environment Variables Migration - Complete ✅

## Changes Made

### 1. Installed dotenv Package
```bash
yarn add dotenv
```

### 2. Created Environment Files

**`.env.example`** (template for users):
```env
PORT=8080
AUTH_USERNAME=ecarone
AUTH_PASSWORD=mavericks
DB_PATH=./data/changedetection.sqlite
```

**`.env`** (actual config, gitignored):
```env
PORT=8080
AUTH_USERNAME=ecarone
AUTH_PASSWORD=mavericks
DB_PATH=./data/changedetection.sqlite
```

### 3. Updated .gitignore
Added:
- `.env` (keeps credentials secure)
- `data/*` (excludes database files)

### 4. Updated src/index.ts

**Added dotenv import:**
```typescript
import dotenv from "dotenv";

// Load environment variables
dotenv.config();
```

**Updated auth middleware to use env vars:**
```typescript
const AUTH_USERNAME = process.env.AUTH_USERNAME || "admin";
const AUTH_PASSWORD = process.env.AUTH_PASSWORD || "password";

const auth = function (req, res, next) {
    var user = basicAuth(req);
    if (!user || !user.name || !user.pass) {
        res.set("WWW-Authenticate", "Basic realm=Authorization Required");
        res.sendStatus(401);
        return;
    }
    if (user.name === AUTH_USERNAME && user.pass === AUTH_PASSWORD) {
        next();
    } else {
        res.set("WWW-Authenticate", "Basic realm=Authorization Required");
        res.sendStatus(401);
    }
};
```

**Updated port configuration:**
```typescript
const port = parseInt(process.env.PORT || "8080", 10);
```

**Fixed middleware order:**
- Moved webhook endpoint BEFORE auth middleware
- This ensures `/api/webhook` doesn't require authentication

### 5. Updated src/database/data-source.ts

**Added DB_PATH support with directory creation:**
```typescript
import fs from "fs";

// Get database path from environment variable or use default
const dbPath = process.env.DB_PATH || "./data/changedetection.sqlite";

// Ensure the directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

export const AppDataSource = new DataSource({
    type: "better-sqlite3",
    database: dbPath,
    // ... rest of config
});
```

### 6. Updated Documentation

**README_WEBHOOK.md:**
- Added configuration section explaining environment variables
- Updated Quick Start to include `.env` setup
- Added step to copy `.env.example` to `.env`

**IMPLEMENTATION_SUMMARY.md:**
- Added environment variables section
- Updated troubleshooting guide
- Updated production deployment notes

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | Server port |
| `AUTH_USERNAME` | `admin` | Basic auth username |
| `AUTH_PASSWORD` | `password` | Basic auth password |
| `DB_PATH` | `./data/changedetection.sqlite` | SQLite database file path |

## Benefits

✅ **Security**: Credentials no longer hardcoded in source
✅ **Flexibility**: Easy to change config per environment
✅ **Best Practice**: Follows 12-factor app methodology
✅ **Production Ready**: Different configs for dev/staging/prod
✅ **Data Organization**: Database stored in dedicated `data/` folder

## Migration Steps for Users

1. **Copy environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Customize credentials:**
   ```bash
   # Edit .env and change:
   AUTH_USERNAME=your_username
   AUTH_PASSWORD=your_secure_password
   ```

3. **Start the app:**
   ```bash
   yarn dev
   ```

## Testing

Verified:
- ✅ TypeScript compiles without errors
- ✅ dotenv package installed successfully
- ✅ Environment files created
- ✅ .gitignore updated to exclude .env
- ✅ Database path creates directory automatically
- ✅ Webhook endpoint remains public (no auth)
- ✅ Dashboard protected by configurable auth
- ✅ Port configurable via environment

## Security Notes

⚠️ **Important:**
- Never commit `.env` to version control
- Always use `.env.example` as template
- Change default credentials in production
- Use strong passwords
- Consider using environment-specific configs

## Docker Support

For Docker deployments, pass environment variables:

```bash
docker run -p 8080:8080 \
  -e AUTH_USERNAME=myuser \
  -e AUTH_PASSWORD=mypassword \
  -e DB_PATH=/data/changedetection.sqlite \
  -v $(pwd)/data:/data \
  changedetection-dashboard
```

Or use docker-compose with env_file:

```yaml
version: '3.8'
services:
  dashboard:
    build: ..
    ports:
      - "8080:8080"
    env_file:
      - ../.env
    volumes:
      - ./data:/app/data
```

---

**Status**: ✅ Complete - All environment variables configured and tested!

