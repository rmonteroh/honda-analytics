# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Start and Build
- `npm run dev` - Start development server with hot reload using nodemon and tsx
- `npm start` - Start production server using tsx
- `npm run build` - Compile TypeScript to JavaScript in the `dist/` folder
- `npm run serve` - Run compiled JavaScript from `dist/app.js`

### Code Quality
- `npx eslint .` - Run ESLint with TypeScript support

## Architecture Overview

This is a Node.js Express analytics API that connects to PocketBase to analyze Honda lead conversation data. The application serves analytics data through a single endpoint.

### Core Structure
- **Entry Point**: `src/app.ts` - Express server with single route at `/` that aggregates analytics data
- **Analytics Module**: `src/stats/index.ts` - Contains all PocketBase query functions for lead analysis

### Data Flow
1. Express endpoint authenticates with PocketBase using superuser credentials
2. Executes parallel queries for different lead categories:
   - Follow-up leads (non-qualified leads still in first contact)
   - Accepted leads (opted in with WhatsApp offer tracking)
   - Rejected leads (explicitly opted out)
   - Total Honda conversations count
3. Returns aggregated statistics with percentages and breakdowns

### Key Constants
- `HONDA_ORGANIZATION_ID`: "7d48b89x9b1l1e5" - Honda organization filter
- `PROD_AGENT_ID`: "51a8x36fd1265g7" - Production agent filter
- `FIRST_TRY_CONTACT_STEP`: "first_try" - Initial contact step identifier

### PocketBase Integration
Uses batched pagination (`BATCH_SIZE: 100`) to handle large datasets efficiently. All queries filter by Honda organization and production agent to ensure data accuracy.

## Technology Stack
- **Runtime**: Node.js with TypeScript ESM modules
- **Framework**: Express.js
- **Database Client**: PocketBase SDK
- **Build Tools**: TypeScript compiler, tsx for development
- **Code Quality**: ESLint with TypeScript support
- **Date Utilities**: date-fns library