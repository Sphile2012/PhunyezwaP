# Netlify Deployment Guide

## Option 1: Manual Deployment (Drag & Drop)

1. Go to https://app.netlify.com/drop
2. Drag and drop the `build` folder from this project
3. Done! Your site will be live instantly

## Option 2: Git Deployment (Automatic)

1. Push your code to GitHub/GitLab
2. Go to https://app.netlify.com
3. Click "Add new site" → "Import an existing project"
4. Connect your Git repository
5. Netlify will automatically detect the `netlify.toml` configuration
6. Click "Deploy site"

## Important Files

- `netlify.toml` - Netlify configuration (already configured)
- `.env` - Environment variables to disable source maps and ESLint warnings
- `build/` - Production build folder (deploy this manually if needed)

## Build Configuration

The project is configured to:
- Use Node.js 16.20.0 (compatible with react-scripts 5.0.1)
- Ignore warnings during build (CI=false)
- Handle React Router with proper redirects

## Troubleshooting

If build fails on Netlify:
1. Check build logs for specific errors
2. Ensure Node version is set to 16.20.0
3. Make sure `netlify.toml` is in the root directory
4. Try manual deployment with the pre-built `build` folder
