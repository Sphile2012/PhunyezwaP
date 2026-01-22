# Project Build Guide

## Tech Stack

This project is built using the following technologies:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Prerequisites

Make sure your system has Node.js and npm installed.

We recommend using nvm to install Node.js: [nvm Installation Guide](https://github.com/nvm-sh/nvm#installing-and-updating)

## Install Dependencies

```sh
npm install
```

## Development Server

Start the development server with hot reload and instant preview:

```sh
npm run dev
```

## Build Project

Build for production:

```sh
npm run build
```

## Preview Build

Preview the built project:

```sh
npm run preview
```

## Project Structure

```
src/
├── components/     # UI Components
├── pages/         # Page Components
├── hooks/         # Custom Hooks
├── lib/           # Utility Library
└── main.tsx       # Application Entry Point
```

## Repository

View the project on GitHub: https://github.com/Sphile2012/PhunyezwaP

## Deploy to Netlify

1. Connect this repository to Netlify.
2. Set the build command to `npm run build` and the publish directory to `dist`.
3. (Optional) Add environment variables in Netlify's dashboard if you integrate external services.

This repository includes a `netlify.toml` with recommended settings.
