# Fix for Event Creation and Loading Issues

## Problembeskrivning (Problem Description)

Two issues were reported:
1. **"Kunde inte skapa evenemang"** - Cannot create events
2. **"Kunde inte ladda evenemang"** - Cannot load events in dashboard

## Rotorsaken (Root Cause)

The GET `/api/events` endpoint filtered events by `isActive: true` only. This was designed for public pages to show only active events. However, the admin dashboard used the same endpoint, which meant:

- If an event was created but somehow became inactive, it wouldn't appear in the admin dashboard
- Admin users couldn't see or manage inactive events
- The admin dashboard should show ALL events for management purposes

## Lösningen (Solution)

Added support for an optional query parameter `?all=true` to the GET `/api/events` endpoint:

### Backend Changes (`apps/api/src/routes/events.ts`)
```typescript
// Allow fetching all events (including inactive) with ?all=true query parameter
const includeAll = req.query.all === 'true';

const events = await prisma.event.findMany({
  where: includeAll ? {} : {
    isActive: true,
  },
  // ... rest of the query
});
```

### Frontend API Client (`apps/web/src/lib/api.ts`)
```typescript
export const eventsApi = {
  getAll: (includeAll: boolean = false) => api.get('/api/events', { params: { all: includeAll } }),
  // ... rest of the methods
};
```

### Admin Pages
- **Dashboard** (`apps/web/src/app/admin/dashboard/page.tsx`): Uses `eventsApi.getAll(true)` to fetch all events
- **Edit Event** (`apps/web/src/app/admin/events/[id]/page.tsx`): Uses `eventsApi.getAll(true)` to be able to edit inactive events

### Public Pages
- Home page and registration page continue to use `eventsApi.getAll()` (without parameter)
- This returns only active events, maintaining the current public behavior

## Fördelar (Benefits)

1. **Backward Compatible**: Public pages continue to work as before, showing only active events
2. **Admin Control**: Admins can now see and manage all events, including inactive ones
3. **Minimal Changes**: Only 4 files changed, with small, focused modifications
4. **No Breaking Changes**: All existing functionality preserved

## Testning (Testing)

To verify the fix works:

1. **Create a new event** via `/admin/events/new`
   - Fill in the form with required fields (name, slug, mode, date)
   - Click "Skapa evenemang"
   - Should successfully create the event and redirect to dashboard

2. **Dashboard should load all events**
   - Dashboard should display the newly created event
   - All events (both active and inactive) should be visible
   - No "Kunde inte ladda evenemang" error

3. **Public pages show only active events**
   - Visit home page (`/`)
   - Visit registration page (`/anmalan`)
   - These should only show active events

4. **Edit inactive events**
   - Change an event's status to inactive
   - Verify it still appears in admin dashboard
   - Verify admin can still edit it

## Filer ändrade (Files Changed)

1. `apps/api/src/routes/events.ts` - Added query parameter support
2. `apps/web/src/lib/api.ts` - Updated API client method signature
3. `apps/web/src/app/admin/dashboard/page.tsx` - Request all events
4. `apps/web/src/app/admin/events/[id]/page.tsx` - Request all events

## Byggstatus (Build Status)

✅ API builds successfully (`npm run build`)
✅ Web builds successfully (`npm run build`)
✅ API linter passes (`npm run lint`)
✅ Web linter passes (`npm run lint`)
✅ No new errors or warnings introduced
