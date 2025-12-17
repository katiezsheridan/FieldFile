# CLAUDE.md - AI Assistant Guide for FieldFile

**Last Updated**: 2025-12-17
**Repository**: katiezsheridan/FieldFile
**Status**: Initial repository setup

---

## Overview

**FieldFile** is a comprehensive wildlife activity filing management platform designed for landowners to track, document, and file wildlife activities required for tax exemptions and regulatory compliance. The platform streamlines the documentation process, provides guided workflows, and manages submissions to county authorities.

### Project Purpose

FieldFile serves as a "TurboTax for wildlife filing" - guiding landowners through:
- Documenting wildlife activities with photos and evidence
- Tracking activity completion across multiple properties
- Managing deadlines and submission requirements
- Filing reports with county authorities
- Maintaining historical records and compliance documentation

This document serves as a comprehensive guide for AI assistants (Claude and others) working on the FieldFile codebase. It outlines the repository structure, development workflows, conventions, and best practices that should be followed.

---

## Domain Context

### Target Users
- **Landowners**: Property owners managing wildlife tax exemptions
- **Co-owners**: Additional property owners with shared access
- **Property Managers**: Professional managers overseeing multiple properties
- **Ranch Hands**: Staff members who complete activities and upload evidence

### Key Domain Terms
- **Wildlife Activity**: Required conservation activities (e.g., birdhouse maintenance, habitat management)
- **Filing**: Annual report submission to county authorities for tax exemption
- **Property**: Land parcel with wildlife activities being tracked
- **Documentation**: Evidence package including photos, receipts, and timestamps
- **County Submission**: The process of filing reports with local government
- **Tax Exemption**: Agricultural/wildlife tax valuation for property tax reduction
- **County Standards**: Specific requirements set by local authorities for documentation

### Common Wildlife Activities

Understanding typical activities helps in designing appropriate tracking and documentation:

1. **Birdhouse Installation & Maintenance**
   - Installation of nest boxes
   - Regular cleaning and inspection
   - GPS location tracking
   - Photo documentation requirements

2. **Habitat Management**
   - Native plant cultivation
   - Invasive species removal
   - Brush pile creation
   - Water source provision

3. **Food Plot Management**
   - Seed planting for wildlife
   - Soil preparation
   - Seasonal maintenance
   - Harvest documentation

4. **Predator Control**
   - Non-lethal deterrents
   - Fencing maintenance
   - Documentation of methods

5. **Wildlife Surveys & Census**
   - Species identification
   - Population counts
   - Trail camera data
   - Observation logs

6. **Erosion Control**
   - Terracing
   - Cover crop planting
   - Water diversion structures

7. **Fencing & Boundaries**
   - Fence repair/maintenance
   - Wildlife-friendly fence modifications
   - Property boundary maintenance

### Compliance Requirements

Different states and counties have varying requirements:
- **Texas**: 1-D-1 Wildlife Management Use
- **Minimum Acreage**: Typically 10-20 acres
- **Activity Requirements**: 3-7 activities per year (varies by county)
- **Documentation**: Photos with timestamps, receipts, hours logged
- **Annual Filing**: Deadline varies by county (typically early Q1)
- **Re-qualification**: Annual review required

---

## Repository Status

**Current Status**: Initial repository setup and planning phase

**Planned Core Features**:
1. Multi-property dashboard with year-over-year filing history
2. Activity tracking with photo documentation and reminders
3. Guided filing workflow ("TurboTax-style" questionnaire)
4. County submission tracking and status management
5. Document vault with AI-powered validation
6. Calendar integration for scheduling FieldFile services
7. Interactive property maps with GPS coordinates
8. Activity planner with deadline tracking
9. Role-based access control for team collaboration
10. Billing and subscription management

---

## Project Structure

```
FieldFile/
├── CLAUDE.md           # This file - AI assistant guide
└── .git/               # Git version control
```

### Expected Structure

```
FieldFile/
├── src/
│   ├── components/          # React components (UI)
│   │   ├── dashboard/       # Property dashboard views
│   │   ├── activities/      # Activity tracking components
│   │   ├── filing/          # Filing workflow components
│   │   ├── documents/       # Document vault components
│   │   ├── calendar/        # Scheduling components
│   │   ├── maps/            # Property map integration
│   │   ├── billing/         # Subscription management
│   │   └── shared/          # Reusable UI components
│   │
│   ├── pages/               # Page-level components
│   │   ├── properties/      # Multi-property views
│   │   ├── filing-wizard/   # Guided filing flow
│   │   ├── profile/         # User profile management
│   │   └── admin/           # Administrative pages
│   │
│   ├── services/            # Business logic and API calls
│   │   ├── api/             # API client services
│   │   ├── auth/            # Authentication service
│   │   ├── storage/         # File upload/storage service
│   │   ├── ai/              # AI document validation
│   │   └── notifications/   # Email/SMS service
│   │
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Utility functions
│   ├── types/               # TypeScript type definitions
│   ├── contexts/            # React context providers
│   └── constants/           # App constants and enums
│
├── server/                  # Backend API (if applicable)
│   ├── controllers/         # Request handlers
│   ├── models/              # Data models
│   ├── routes/              # API routes
│   ├── middleware/          # Express middleware
│   └── db/                  # Database migrations/seeds
│
├── tests/
│   ├── unit/                # Unit tests
│   ├── integration/         # Integration tests
│   └── e2e/                 # End-to-end tests
│
├── docs/                    # Documentation
│   ├── api/                 # API documentation
│   ├── architecture/        # Architecture diagrams
│   └── user-guides/         # User documentation
│
├── public/                  # Static assets
├── config/                  # Configuration files
├── scripts/                 # Build and utility scripts
├── .github/                 # GitHub workflows and templates
├── CLAUDE.md                # This file - AI assistant guide
├── README.md                # Project documentation
└── package.json             # Dependencies
```

---

## Feature Requirements

### 1. Multi-Property Dashboard
- **Property Tabs**: Flip between properties with individual dashboards
- **Historical Filing View**: Show filings by year for retrospective review
- **Progress Tracking**: Progress bar showing completed vs. remaining activities for the year
- **Property Map**: Interactive map showing property boundaries and locations

### 2. Activity Tracking & Documentation
- **Activity Tabs**: Dedicated tab for each wildlife activity
- **Photo Gallery**: View photos across years for each activity
- **Activity Reminders**: Automated reminders for when to complete activities
- **Multiple Upload Methods**:
  - Text photos to system
  - Email photos to system
  - Direct upload through web interface
- **Supplier Integration**: Sponsored sections showing where to purchase supplies
- **Activity Status**: Track which activities are complete, in-progress, or pending

### 3. Guided Filing Workflow ("TurboTax for Wildlife")
Step-by-step questionnaire:
1. **State Selection**: "What state?"
2. **Land Size**: "How big is your land?"
3. **Activity Review**: "What activities did you complete this year?"
   - Show tags/labels from prior year activities
4. **Photo Upload Method**: "Would you like to upload, text, or email photos?"
5. **Filing Option**: "Would you like us to file the report or you?"
   - Tag with $15 fee for FieldFile filing service
6. **Review & Submit**: Final review before submission

### 4. County Submission Management
- **Submission Status Tracking**:
  - Draft
  - Ready to file
  - Filed
  - Accepted
  - Needs follow-up
- **Filing Metadata**:
  - Date filed
  - Method of filing (online, mail, county portal)
  - Confirmation receipt or submission PDF
- **Deadline Tracking**:
  - Countdown bar showing days until submission deadline
  - Color-coded urgency indicators based on deadline proximity
  - "Get help from FieldFile" support button

### 5. Document Vault
- **Documentation Checklist**: Required documents for each activity
- **AI Document Validation**:
  - Scan documents for county standards compliance
  - Warning alerts if evidence is insufficient
  - Smart detection of document types
- **Evidence Tracking**:
  - Photos checkbox
  - Receipts checkbox
  - Maintenance time/date stamps
- **Secure Storage**: Historical document retention

### 6. Calendar & Scheduling
- **Service Booking**: Book FieldFile to:
  - Come take photos
  - Complete activities on behalf of customer
- **Activity Planner**: Annual activity planning with:
  - DIY option
  - FieldFile-assisted option
  - Skip for this year option
  - Due dates for each activity

### 7. Interactive Property Maps
- **Property Boundaries**: Visual representation of land
- **Activity Locations**: Pin specific locations (e.g., birdhouse placement)
- **Google Maps Integration**:
  - Walk users through getting GPS coordinates
  - Add pinpoints to map for specific features
  - Street view and satellite imagery

### 8. FieldNotes (Activity Journaling)
- **Free-text Documentation**: Notes for each activity
- **Weather Logging**: Record weather conditions during activities
- **Delay Tracking**: Document reasons for delays or partial completion
- **Action Items**: Create dated action items for follow-up tasks

### 9. Role-Based Access Control
User roles with different permissions:
- **Landowner**: Full access and ownership
- **Co-owner**: Shared ownership access
- **Property Manager**: Professional management capabilities
- **Ranch Hand**: Field-level documentation and uploads

Permission levels:
- View only
- Upload and notes only
- Submission permissions

### 10. Billing & Subscriptions
- **Subscription Dashboard**: Show current subscription tier
- **Included Services**: What's covered in current plan
- **Upgrade Options**: Display available upgrade tiers
- **Add-on Services**:
  - FieldFile photo services
  - Activity completion services
  - Report filing service ($15)
- **Payment History**: Transaction records

### 11. Profile Management
- **Landowner Information**:
  - Names
  - Phone numbers
  - Email addresses
- **Notification Preferences**: Communication settings
- **Account Settings**: Password, security, preferences

### 12. Referral Program
- **Referral Bonus**: Incentive for getting neighbors to join
- **Referral Tracking**: Monitor referred users
- **Bonus Application**: Automatic credit for successful referrals

### 13. Local Supplier Directory
- **Supplier Listings**: Local providers for:
  - Materials
  - Fence repair services
  - Seed planting services
  - Wildlife activity supplies
- **Contact Information**: Direct links to suppliers
- **Sponsored Partnerships**: Featured suppliers

### 14. Activity Suggestions
- **Recommendation Engine**: Suggest additional activities based on:
  - Property characteristics
  - Historical activities
  - Seasonal opportunities
- **Benefits Explanation**: Why suggested activities help

---

## Development Workflows

### Branch Strategy

**Current Branch**: `claude/claude-md-mjab7ureykxhh2g5-8WhiB`

#### Branch Naming Conventions:
- Feature branches: `feature/feature-name`
- Bug fixes: `fix/bug-description`
- AI-assisted branches: `claude/descriptive-name-sessionid`
- Hotfixes: `hotfix/issue-description`

#### Git Operations Best Practices:
1. **Always push with**: `git push -u origin <branch-name>`
2. **Branch requirements**: AI branches must start with `claude/` and end with matching session ID
3. **Network retry policy**: Retry up to 4 times with exponential backoff (2s, 4s, 8s, 16s) for network errors
4. **Fetch specific branches**: `git fetch origin <branch-name>` instead of fetching all

### Commit Guidelines

#### Commit Message Format:
```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

#### Example:
```
feat(auth): add user authentication module

- Implement JWT token generation
- Add password hashing with bcrypt
- Create login and registration endpoints

Closes #123
```

### Pull Request Process

1. **Create feature branch** from main/develop
2. **Make changes** with clear, atomic commits
3. **Write tests** for new functionality
4. **Update documentation** as needed
5. **Push to remote**: `git push -u origin <branch-name>`
6. **Create PR** using: `gh pr create --title "Title" --body "Description"`

#### PR Description Template:
```markdown
## Summary
- Brief description of changes
- Problem being solved

## Changes Made
- List of specific changes
- Files modified and why

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed

## Documentation
- [ ] Code comments added
- [ ] README updated (if needed)
- [ ] CLAUDE.md updated (if needed)
```

---

## Code Quality Standards

### General Principles

1. **KISS (Keep It Simple, Stupid)**
   - Avoid over-engineering
   - Only add complexity when necessary
   - Don't add features beyond requirements

2. **YAGNI (You Aren't Gonna Need It)**
   - Don't build for hypothetical future requirements
   - Three similar lines are better than premature abstraction
   - No helpers/utilities for one-time operations

3. **Security First**
   - Validate at system boundaries (user input, external APIs)
   - Prevent OWASP Top 10 vulnerabilities:
     - Command injection
     - XSS (Cross-Site Scripting)
     - SQL injection
     - CSRF (Cross-Site Request Forgery)
     - Insecure authentication/authorization
   - Never commit secrets (.env files, credentials, API keys)

4. **Clean Code**
   - Self-documenting code preferred over comments
   - Only comment when logic isn't self-evident
   - Remove unused code completely (no commented-out code)
   - No backwards-compatibility hacks unless necessary

### Code Review Checklist

- [ ] Code follows existing patterns in the codebase
- [ ] No security vulnerabilities introduced
- [ ] Error handling appropriate for the context
- [ ] Tests cover new functionality
- [ ] No unnecessary complexity added
- [ ] Documentation updated if needed
- [ ] No secrets or sensitive data committed

---

## AI Assistant Conventions

### Before Making Changes

1. **READ FIRST**: Always read files before modifying them
2. **UNDERSTAND CONTEXT**: Grep/search for related code and patterns
3. **FOLLOW PATTERNS**: Match existing code style and architecture
4. **ASK WHEN UNCLEAR**: Use AskUserQuestion for ambiguous requirements

### Task Management

Use `TodoWrite` tool to:
- Plan multi-step tasks (3+ steps)
- Track progress on complex implementations
- Provide visibility to users
- Mark tasks in_progress before starting
- Mark completed immediately after finishing

#### When to Use TodoWrite:
✅ Complex multi-step tasks
✅ Multiple related changes across files
✅ Non-trivial implementations
✅ User provides multiple tasks
❌ Single straightforward tasks
❌ Trivial one-step operations
❌ Simple questions or research

### Tool Usage

1. **Prefer specialized tools**:
   - `Read` instead of `cat`
   - `Edit` instead of `sed/awk`
   - `Write` instead of `echo >` or heredoc
   - `Grep` instead of `grep` or `rg` commands
   - `Glob` instead of `find`

2. **Parallel execution**:
   - Run independent operations in parallel
   - Use single message with multiple tool calls
   - Sequential only when dependencies exist

3. **File operations**:
   - Always prefer editing existing files over creating new ones
   - Never create unnecessary documentation files
   - Read files before editing them

### Communication

- Be concise and technical
- Use GitHub-flavored markdown
- Reference code with `file_path:line_number` format
- Never use bash echo for communication
- Output text directly to user

---

## Technology Stack

### Recommended Stack

#### Frontend
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite or Next.js (for SSR/SEO benefits)
- **UI Library**: Tailwind CSS + shadcn/ui or Material-UI
- **State Management**: React Context + hooks (or Zustand for complex state)
- **Form Handling**: React Hook Form + Zod validation
- **Date/Time**: date-fns or Day.js
- **Maps**: Google Maps JavaScript API + @react-google-maps/api
- **File Upload**: react-dropzone
- **Calendar**: FullCalendar or react-big-calendar
- **Charts**: Recharts or Chart.js

#### Backend (if separate API)
- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Express.js or Fastify
- **API Style**: RESTful API or GraphQL (Apollo Server)
- **Authentication**: Auth0, Clerk, or JWT with passport.js
- **File Storage**: AWS S3, Google Cloud Storage, or Cloudinary
- **Email/SMS**: SendGrid, Twilio
- **AI Integration**: OpenAI API for document validation

#### Database
- **Primary Database**: PostgreSQL (for relational data)
- **ORM**: Prisma or TypeORM
- **File Metadata**: Store in PostgreSQL with S3 URLs
- **Caching**: Redis (optional for session/cache management)

#### Testing
- **Unit Tests**: Vitest or Jest
- **Integration Tests**: Supertest (API) + React Testing Library
- **E2E Tests**: Playwright or Cypress
- **Coverage**: Built-in coverage tools
- **Test Data**: Faker.js for mock data

#### DevOps & Infrastructure
- **Version Control**: Git + GitHub
- **CI/CD**: GitHub Actions
- **Hosting Options**:
  - Frontend: Vercel, Netlify, or AWS Amplify
  - Backend: AWS (EC2/ECS/Lambda), Railway, or Render
  - Database: AWS RDS, Supabase, or PlanetScale
- **Monitoring**: Sentry (error tracking), LogRocket (session replay)
- **Analytics**: PostHog or Mixpanel

#### Development Tools
- **Package Manager**: pnpm or npm
- **Code Quality**: ESLint + Prettier
- **Git Hooks**: Husky + lint-staged
- **Type Safety**: TypeScript strict mode
- **API Documentation**: OpenAPI/Swagger or GraphQL Playground
- **Environment Management**: dotenv

### Technology Decisions Log

Document key decisions here as they are made:
- **[Date]**: Decision and rationale
- Example: "2025-12-17: Chose React + TypeScript for type safety and developer experience"

---

## Architecture Patterns

### Recommended Architecture

#### Frontend Architecture
- **Component Pattern**: Atomic Design (Atoms, Molecules, Organisms, Templates, Pages)
- **State Management**:
  - Local state: useState for component-specific state
  - Global state: Context API for user/auth, property selection
  - Server state: React Query or SWR for API data caching
- **Routing**: React Router with protected routes
- **Code Splitting**: Lazy loading for page-level components

#### Backend Architecture (if applicable)
- **Pattern**: Layered Architecture
  - **Controllers**: Handle HTTP requests/responses
  - **Services**: Business logic layer
  - **Repositories**: Data access layer
  - **Models**: Data entities
- **API Design**: RESTful with resource-based URLs
  - `/api/properties` - Property management
  - `/api/properties/:id/activities` - Activity tracking
  - `/api/filings` - Filing submissions
  - `/api/documents` - Document management

#### Data Flow
```
User Action → Component → Service/API Call → Backend → Database
                ↓                                ↓
            Local State Update          Store/Update Data
                ↓                                ↓
            UI Re-render            ← Return Response
```

#### Key Design Patterns

1. **Repository Pattern**: Abstract data access logic
2. **Service Layer Pattern**: Encapsulate business logic
3. **Observer Pattern**: For real-time updates (filing status, notifications)
4. **Strategy Pattern**: For different filing methods (online, mail, portal)
5. **Factory Pattern**: For creating different document types
6. **Decorator Pattern**: For role-based permission wrapping

#### Error Handling Strategy
- **API Errors**: Consistent error response format
  ```json
  {
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "User-friendly message",
      "details": { "field": "specific error" }
    }
  }
  ```
- **Frontend**: Error boundaries for component errors
- **Validation**: Zod schemas for runtime validation
- **Logging**: Structured logging with context

#### Security Architecture
- **Authentication**: JWT tokens with refresh mechanism
- **Authorization**: Role-Based Access Control (RBAC)
  - Roles: landowner, co-owner, property_manager, ranch_hand
  - Permissions: view, upload, edit, submit, admin
- **Data Isolation**: Row-level security for multi-tenancy
- **File Upload**: Virus scanning, type validation, size limits
- **API Rate Limiting**: Prevent abuse

#### Data Model (Core Entities)

```
User
├── Properties (1:many)
│   ├── Activities (1:many)
│   │   ├── ActivityRecords (1:many)
│   │   │   └── Photos/Documents (1:many)
│   │   └── FieldNotes (1:many)
│   ├── MapPins (1:many)
│   └── Filings (1:many)
│       └── Documents (1:many)
├── Roles (many:many via PropertyUserRole)
└── Subscriptions (1:1)
```

### Architecture Decision Records (ADRs)

Document significant architecture decisions:

**Template:**
```
## ADR-001: [Title]
**Date**: YYYY-MM-DD
**Status**: Proposed | Accepted | Deprecated

### Context
What is the issue we're trying to solve?

### Decision
What decision did we make?

### Consequences
What are the trade-offs? Positive and negative impacts?

### Alternatives Considered
What other options did we evaluate?
```

**Example:**
```
## ADR-001: Use PostgreSQL for Primary Database
**Date**: 2025-12-17
**Status**: Proposed

### Context
Need a reliable database for storing property, activity, and filing data.
Relationships between entities are complex and relational.

### Decision
Use PostgreSQL with Prisma ORM.

### Consequences
- ✅ ACID compliance for filing submissions
- ✅ Complex queries with joins
- ✅ JSON column support for flexible metadata
- ⚠️  Requires hosting/management
- ⚠️  Learning curve for team

### Alternatives Considered
- MongoDB: Too flexible, relationships harder to maintain
- MySQL: Less feature-rich than PostgreSQL
- Supabase: Considered for managed PostgreSQL + auth
```

---

## Testing Strategy

### Test Pyramid

```
        /\
       /  \      E2E Tests (Few)
      /____\
     /      \    Integration Tests (Some)
    /________\
   /          \  Unit Tests (Many)
  /____________\
```

### Testing Guidelines

1. **Unit Tests**:
   - Test individual functions/methods
   - Mock external dependencies
   - Fast execution
   - High coverage for business logic

2. **Integration Tests**:
   - Test component interactions
   - Use test databases/services
   - Verify data flow

3. **E2E Tests**:
   - Test critical user journeys
   - Run in staging environment
   - Fewer tests, high value

### Test Naming Convention

```
describe('ComponentName', () => {
  describe('methodName', () => {
    it('should do expected behavior when condition', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

---

## Security Practices

### Never Commit:
- API keys, tokens, passwords
- `.env` files with real credentials
- Private keys or certificates
- Database connection strings with credentials
- Any PII (Personally Identifiable Information)

### Input Validation:
- Validate and sanitize all user input
- Use parameterized queries (prevent SQL injection)
- Escape output (prevent XSS)
- Validate file uploads (type, size, content)
- Rate limit API endpoints

### Authentication & Authorization:
- Use established libraries (don't roll your own crypto)
- Implement proper session management
- Use HTTPS for all sensitive communications
- Follow principle of least privilege

---

## Debugging and Troubleshooting

### Debugging Strategy

1. **Reproduce the issue**: Create minimal test case
2. **Check recent changes**: `git log`, `git diff`
3. **Read error messages**: Full stack traces provide context
4. **Add logging**: Strategic log points to trace execution
5. **Use debugging tools**: Appropriate for the language/framework
6. **Binary search**: Comment out sections to isolate issue

### Common Issues

Document common problems and solutions as they arise.

---

## Performance Optimization

### Optimization Guidelines

1. **Measure first**: Profile before optimizing
2. **Focus on bottlenecks**: 80/20 rule applies
3. **Avoid premature optimization**: Correct first, fast second
4. **Consider trade-offs**: Memory vs CPU, readability vs speed

### Performance Checklist

- [ ] Database queries optimized (indexes, N+1 queries)
- [ ] Caching strategy implemented where appropriate
- [ ] Large data sets paginated
- [ ] Assets minified and compressed
- [ ] Lazy loading for non-critical resources

---

## Documentation Standards

### Code Documentation

- **Docstrings/Comments**: Explain WHY, not WHAT
- **README files**: Setup instructions, architecture overview
- **API documentation**: Endpoints, parameters, responses
- **Inline comments**: Only when logic is non-obvious

### Keeping Docs Updated

- Update docs in the same PR as code changes
- Review CLAUDE.md monthly or after major changes
- Keep architecture diagrams current
- Document breaking changes prominently

---

## Continuous Integration/Deployment

### To Be Configured

Document CI/CD pipeline as it's established:
- Build process
- Test automation
- Code quality checks
- Deployment stages
- Rollback procedures

---

## Project-Specific Conventions

### To Be Added

As patterns emerge, document:
- Naming conventions (variables, functions, files)
- Code organization preferences
- Import/export patterns
- Error handling approaches
- Logging format and levels

---

## Resources and References

### Useful Links

- Repository: https://github.com/katiezsheridan/FieldFile
- Issue Tracker: (To be added)
- Documentation: (To be added)
- CI/CD Dashboard: (To be added)

### Learning Resources

Add relevant documentation, tutorials, or references specific to technologies used in this project.

---

## Maintenance

### Updating This Document

This document should be updated when:
- Project structure changes significantly
- New patterns or conventions are established
- Technology stack changes
- Major architectural decisions are made
- New team members need different onboarding information

### Review Schedule

- **Weekly**: During active development
- **Monthly**: During maintenance phase
- **After major releases**: Document new patterns and learnings

---

## FAQ for AI Assistants

### Q: Should I create new files or edit existing ones?
**A**: Always prefer editing existing files. Only create new files when explicitly required.

### Q: How much error handling should I add?
**A**: Only add error handling at system boundaries (user input, external APIs). Trust internal code and framework guarantees.

### Q: Should I add comments to code I'm reviewing?
**A**: Only add comments where logic isn't self-evident. Don't add docstrings or comments to code you didn't change.

### Q: What if requirements are ambiguous?
**A**: Ask for clarification before implementing. Multiple valid approaches mean you should present options to the user.

### Q: Should I refactor code I see that could be improved?
**A**: No. Only make changes directly requested or clearly necessary. Avoid "improvements" beyond the task scope.

### Q: How do I handle secrets in the code?
**A**: Never commit secrets. Use environment variables and document them in `.env.example` without real values.

### Q: Should I add feature flags for new features?
**A**: Only if explicitly requested. Don't add backwards-compatibility shims when you can just change the code.

### Q: What if tests are failing?
**A**: Never mark a task as completed if tests fail. Fix failures or create a new task to track the blocker.

---

## Version History

### Version 1.1 - 2025-12-17
**Major Update: Project Specification Integration**

- Added comprehensive project overview and domain context
- Documented FieldFile as wildlife activity filing management platform
- Added 14 detailed feature requirement sections:
  - Multi-property dashboard
  - Activity tracking & documentation
  - Guided filing workflow ("TurboTax for Wildlife")
  - County submission management
  - Document vault with AI validation
  - Calendar & scheduling
  - Interactive property maps
  - FieldNotes (activity journaling)
  - Role-based access control
  - Billing & subscriptions
  - Profile management
  - Referral program
  - Local supplier directory
  - Activity suggestions
- Updated project structure with FieldFile-specific directories
- Added recommended technology stack:
  - Frontend: React + TypeScript, Tailwind CSS
  - Backend: Node.js + Express/Fastify
  - Database: PostgreSQL + Prisma
  - Testing: Vitest, Playwright
- Documented architecture patterns and design decisions
- Added data model and entity relationships
- Created Architecture Decision Records (ADR) template
- Enhanced security architecture with RBAC details

### Version 1.0 - 2025-12-17
**Initial Release**

- Created initial CLAUDE.md structure for empty repository
- Established basic conventions and workflows
- Defined git workflows and branch strategy
- Set code quality standards and security practices
- Created template sections for future documentation
- Added AI assistant-specific conventions and FAQ

---

## Contact and Support

For questions about this document or the project:
- Create an issue in the repository
- Contact project maintainers
- Refer to the main README.md (once created)

---

*This document is a living guide and should evolve with the project. All contributors and AI assistants should keep it updated and relevant.*
