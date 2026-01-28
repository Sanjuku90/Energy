# Time & Energy Bank

## Overview

Time & Energy Bank is a gamified virtual energy mining platform where users purchase plans to unlock virtual power stations (solar, wind, hydro). Users earn money by staying connected - the longer they're active, the more energy they "mine" and convert to real earnings. The platform features animated dashboards with turbines and panels, weather-based multipliers, and tiered subscription plans ranging from $49 to $249 with corresponding power outputs and daily earning potential.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **UI Components**: shadcn/ui component library (Radix UI primitives)
- **Animations**: Framer Motion for power station visualizations
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript (ESM modules)
- **Build Tool**: esbuild for server, Vite for client
- **Authentication**: Passport.js with local strategy, session-based auth
- **Session Storage**: PostgreSQL via connect-pg-simple

### Data Layer
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-zod for schema validation
- **Schema Location**: `shared/schema.ts` (shared between client/server)

### Key Data Models
- **Users**: Email, password (hashed), balance, energy balance, connected time, current plan
- **Plans**: Name, price, power (kW), daily min/max earnings
- **Transactions**: User ID, amount, type (deposit/withdrawal/mining/purchase), status

### API Design
- RESTful endpoints defined in `shared/routes.ts` with Zod schemas
- Type-safe request/response contracts shared between frontend and backend
- Endpoints: `/api/register`, `/api/login`, `/api/logout`, `/api/user`, `/api/plans`, `/api/transactions`, `/api/mining/heartbeat`

### Mining System
- Heartbeat mechanism sends periodic updates (every 60 seconds) while user is connected
- Server calculates energy production based on connected time and plan power output
- Balance updates occur in real-time via query invalidation

### Development vs Production
- Development: Vite dev server with HMR, runtime error overlay
- Production: Static file serving from `dist/public`, esbuild-bundled server

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **Session Store**: `connect-pg-simple` for persistent sessions

### Authentication
- Password hashing: Node.js crypto (scrypt)
- Sessions: express-session with 30-day cookie expiry

### Required Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret for session encryption (defaults to "default_secret" in dev)

### Third-Party UI Libraries
- Radix UI primitives (dialogs, dropdowns, forms, etc.)
- Lucide React for icons
- Recharts for data visualization
- Embla Carousel for carousels
- date-fns for date formatting