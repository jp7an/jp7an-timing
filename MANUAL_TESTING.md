# Manual Testing Guide

This document provides step-by-step instructions for manually testing the fixes.

## Prerequisites
- Backend API deployed on Render (or another platform)
- Frontend deployed on Vercel
- Admin password configured in environment variables

## Test Scenario 1: Public Navbar Does Not Show Chiputlämning

### Steps:
1. Open the application homepage in an incognito/private browser window
2. Look at the navigation bar

### Expected Result:
✅ Navigation bar should show:
- Hem
- Anmälan
- Admin

❌ Navigation bar should NOT show:
- Chiputlämning

### Actual Result:
_[To be filled during testing]_

---

## Test Scenario 2: Admin Login Works Correctly

### Steps:
1. Navigate to `/admin`
2. Enter the admin password: `kl4ddkAk@`
3. Click "Logga in"

### Expected Result:
✅ Login succeeds and redirects to `/admin/dashboard`
✅ No authentication errors

### Actual Result:
_[To be filled during testing]_

---

## Test Scenario 3: Chiputlämning Available in Admin Dashboard

### Steps:
1. Login to admin (follow Test Scenario 2)
2. You should be on `/admin/dashboard`
3. Look for the "Snabbåtgärder" (Quick Actions) section
4. Verify "Chiputlämning" button is visible

### Expected Result:
✅ "Chiputlämning" button is visible in the Snabbåtgärder section
✅ Button is styled as `btn btn-secondary`

### Actual Result:
_[To be filled during testing]_

---

## Test Scenario 4: Chiputlämning Requires Authentication

### Steps:
1. In an incognito/private browser window (not logged in)
2. Navigate directly to `/chiputlamning` by typing in the URL

### Expected Result:
✅ Page shows "Kontrollerar behörighet..." (Checking authorization...)
✅ After a moment, redirects to `/admin` login page
❌ Should NOT show the chip distribution form

### Actual Result:
_[To be filled during testing]_

---

## Test Scenario 5: Chiputlämning Works When Authenticated

### Steps:
1. Login to admin (follow Test Scenario 2)
2. Click "Chiputlämning" button in the Snabbåtgärder section
3. Try searching for a participant

### Expected Result:
✅ Page loads successfully
✅ Search functionality works
✅ No authentication errors

### Actual Result:
_[To be filled during testing]_

---

## Test Scenario 6: Token Trimming Works

### Purpose:
Verify that authentication works even if the `ADMIN_PASSWORD` environment variable has trailing/leading whitespace.

### Steps:
1. Set `ADMIN_PASSWORD` environment variable with a trailing space: `kl4ddkAk@ ` (note the space)
2. Restart the backend API
3. Try to login with password `kl4ddkAk@` (without the space)

### Expected Result:
✅ Login succeeds (because trimming removes the trailing space)

### Alternative Test:
1. Set `ADMIN_PASSWORD` normally: `kl4ddkAk@`
2. Login successfully
3. In browser console, modify localStorage to add a trailing space:
   ```javascript
   localStorage.setItem('adminToken', 'kl4ddkAk@ ')
   ```
4. Refresh the page or navigate to a protected route

### Expected Result:
✅ Authentication still works (because middleware trims the token)

### Actual Result:
_[To be filled during testing]_

---

## Common Issues and Troubleshooting

### Issue: Login fails with "Felaktigt lösenord"
- Verify the `ADMIN_PASSWORD` environment variable is set correctly on the backend
- Check for typos in the password
- Try trimming any whitespace from the environment variable

### Issue: Chiputlämning still shows in public navbar
- Clear browser cache
- Verify you're viewing the latest deployment
- Check the build succeeded without errors

### Issue: Cannot access Chiputlämning even when logged in
- Check that you successfully logged in (look for "Admin Dashboard" in the navbar)
- Verify the token is stored in localStorage: `localStorage.getItem('adminToken')`
- Check browser console for any errors

### Issue: Backend returns 500 error
- Verify the backend is running and accessible
- Check that all environment variables are configured
- Look at backend logs for error details

---

## Success Criteria

All test scenarios should pass with ✅ expected results. If any scenario fails, the issue is not fully resolved.

## Regression Testing

After deployment, also verify these features still work:
- [ ] Event creation and management
- [ ] Participant registration
- [ ] Live results display
- [ ] CSV import/export
- [ ] Email notifications
