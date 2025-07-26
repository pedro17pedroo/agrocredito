# AgriCredit System - Angular Credit Application Platform

## Overview

AgriCredit is a comprehensive web application designed to democratize access to agricultural credit in Angola. The platform connects farmers, agricultural companies, and financial institutions, providing a streamlined process for credit applications, simulations, and account management. The system features a bilingual interface (Portuguese) and handles Angolan currency (AOA) with localized formatting.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and build processes
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom agricultural theme colors
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Authentication**: JWT-based with bcrypt password hashing
- **API Pattern**: RESTful API endpoints

### Database Design
The system uses a PostgreSQL database with the following core entities:
- **Users**: Stores farmer, company, cooperative, and financial institution data
- **Credit Applications**: Manages loan requests with project details
- **Accounts**: Tracks approved credit accounts and balances
- **Payments**: Records payment history and transactions

## Key Components

### Authentication System
- JWT token-based authentication with refresh capabilities
- Role-based access control (farmer, company, cooperative, financial_institution)
- Password hashing using bcrypt
- Session management with secure token storage

### Credit Management
- **Application Process**: Multi-step credit application with project type categorization
- **Credit Simulator**: Real-time calculation of loan terms, monthly payments, and interest
- **Account Management**: Track outstanding balances, payment schedules, and account status
- **Payment Processing**: Record and manage loan payments

### User Interface
- **Responsive Design**: Mobile-first approach with agricultural theme
- **Localization**: Portuguese language interface with Angolan formatting
- **Accessibility**: WCAG-compliant components using Radix UI
- **Custom Components**: Specialized forms for agricultural data input

### Angola-Specific Features
- **Phone Validation**: Angolan mobile number format (+244 9XX XXX XXX)
- **Currency Handling**: Kwanza (AOA) formatting and parsing
- **Document Validation**: BI (Bilhete de Identidade) and NIF validation
- **Agricultural Projects**: Support for corn, cassava, cattle, poultry, and horticulture

## Data Flow

### Credit Application Flow
1. User registration with Angolan-specific validation
2. Credit simulation with real-time calculations
3. Formal application submission with project details
4. Financial institution review and approval/rejection
5. Account creation for approved applications
6. Payment tracking and balance management

### Authentication Flow
1. User login with phone/email and password
2. JWT token generation and storage
3. Token validation on protected routes
4. Automatic token refresh for session management

## External Dependencies

### UI and Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Type-safe component variants

### Backend Services
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Type-safe database operations
- **Express**: Web application framework
- **JWT**: Token-based authentication

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety across the application
- **Replit Integration**: Development environment plugins

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds static assets to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations manage schema changes

### Environment Configuration
- **Database URL**: Neon PostgreSQL connection string
- **JWT Secret**: Secure token signing key
- **Node Environment**: Development/production configuration

### Production Deployment
- Single-node deployment with Express serving both API and static files
- PostgreSQL database hosted on Neon's serverless platform
- Environment variables for sensitive configuration
- Health checks and error handling for production reliability

The system is designed to scale horizontally while maintaining data consistency and providing a smooth user experience for agricultural credit management in the Angolan market.