# Vercel Build Issue Fix

## Problem

The Vercel deployment was failing with the error:
```
Error: Cannot read properties of undefined (reading 'fsPath')
```

This occurred after Vercel found a `.vercelignore` file and removed 77 files from the build context, including critical `.git` files.

## Root Cause

The previous branch (`copilot/fix-admin-login-issue`) added an `apps/api/.vercelignore` file with the following content:
```
*
!README.md
```

This file was too aggressive and caused Vercel to remove critical files needed for the build process, resulting in the `fsPath` error when Vercel tried to access file paths that no longer existed.

## Solution

This branch (`copilot/fix-admin-login-issue-2`) fixes the issue by:

1. **Not including the problematic `.vercelignore` file** - The repository is clean with no `.vercelignore` or `vercel.json` files that could interfere with the build process.

2. **Updated Documentation** - Enhanced the README.md with detailed Vercel deployment instructions, explicitly warning against using `.vercelignore` files in subdirectories of a monorepo.

3. **Added Deployment Guidelines** - Added a new section in CONTRIBUTING.md documenting the proper way to deploy this monorepo structure to prevent similar issues in the future.

## Monorepo Best Practices for Vercel

For a monorepo like this project:

- **Frontend (`apps/web`)** should be deployed to Vercel
  - Set "Root Directory" to `apps/web` in Vercel project settings
  - Let Vercel auto-detect Next.js framework
  - Use default build/install commands
  - Configure environment variables only

- **Backend (`apps/api`)** should be deployed to Railway or Render (not Vercel)
  - Set root directory to `apps/api`
  - Follow backend-specific deployment instructions

- **DO NOT** add `.vercelignore` files in subdirectories
  - They can interfere with Vercel's build process
  - The "Root Directory" setting is sufficient for isolation

- **DO NOT** add `vercel.json` at the repository root unless absolutely necessary
  - It can cause framework detection issues
  - Next.js projects work best with default settings

## Verification

The fix has been verified:
- ✅ No `.vercelignore` or `vercel.json` files in the repository
- ✅ Next.js build completes successfully (`npm run build`)
- ✅ Linting passes with only warnings (no errors)
- ✅ All pages render correctly
- ✅ Documentation updated to prevent future issues

## Deployment Instructions

To deploy this branch to Vercel:

1. Go to your Vercel project settings
2. Ensure "Root Directory" is set to `apps/web`
3. Ensure "Framework Preset" is set to "Next.js"
4. Configure environment variable: `NEXT_PUBLIC_API_URL`
5. Deploy

The build should now succeed without the `fsPath` error.
