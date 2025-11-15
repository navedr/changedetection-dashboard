# Value Extraction Implementation Summary

## Changes Made

### 1. ChangeEvent Entity (`src/entities/ChangeEvent.ts`)
Added two new fields to capture the before/after values from webhook messages:
- `oldValue`: Captures the value before the change (from `<del>` tags)
- `newValue`: Captures the value after the change (from `**` tags after `<del>`)

### 2. Webhook Routes (`src/server/routes.ts`)
Added a helper function `extractValues()` that:
- Extracts the old value from `<del>...</del>` tags
- Extracts the new value from `**...**` tags that come after the `<del>` closing tag
- Returns both values as an object

Updated the webhook handler to:
- Call `extractValues()` to extract old and new values from the message
- Save both values to the ChangeEvent entity

## Example

For a webhook message like:
```
<del>$449 â\x80¢</del>
**$353 â\x80¢**
---
...
```

The extraction will capture:
- `oldValue`: "$449 â\x80¢"
- `newValue`: "$353 â\x80¢"

## Testing

Run the test script to verify extraction:
```bash
node test-value-extraction.js
```

## Database Migration

Since the project uses TypeORM with `synchronize: true`, the database schema will automatically update when the application restarts. The new `oldValue` and `newValue` columns will be added to the `change_event` table.

## Usage

When a webhook is received, the old and new values will be automatically extracted and stored in the database. They can be accessed via:
- The `/api/changes/:id` endpoint
- The `/api/watchers/:id` endpoint (which includes all changes for a watcher)
- Directly from the `changeEvent.oldValue` and `changeEvent.newValue` properties

## UI Display

The UI now displays the value changes in a prominent side-by-side comparison:
- **Old Value**: Displayed on the left with red styling and strikethrough
- **New Value**: Displayed on the right with green styling and bold text
- Visual indicators: Red dash icon for old value, green check icon for new value
- Colored borders: Red for old value card, green for new value card

The value change section appears at the top of the change details, making it easy to quickly see what changed.

