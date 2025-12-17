# FieldFile - Wildlife Activity Filing Management

> The TurboTax for wildlife exemption filing

FieldFile is a comprehensive platform designed for landowners to track, document, and file wildlife activities required for tax exemptions and regulatory compliance.

## 🎯 Project Overview

FieldFile streamlines the complex process of managing wildlife tax exemptions by providing:

- **Multi-property dashboard** with year-over-year filing history
- **Activity tracking** with photo documentation and GPS coordinates
- **Guided filing workflow** (TurboTax-style questionnaire)
- **County submission management** with status tracking
- **Document vault** with AI-powered validation
- **Interactive property maps** with Google Maps integration
- **Team collaboration** with role-based access control
- **Service booking** for professional assistance

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 14+ (for backend)
- npm or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/katiezsheridan/FieldFile.git
   cd FieldFile
   ```

2. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
FieldFile/
├── client/                  # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   │   ├── dashboard/   # Dashboard views
│   │   │   ├── activities/  # Activity tracking
│   │   │   ├── filing/      # Filing workflow
│   │   │   ├── documents/   # Document management
│   │   │   ├── calendar/    # Scheduling
│   │   │   ├── maps/        # Property mapping
│   │   │   ├── billing/     # Subscriptions
│   │   │   └── shared/      # Shared UI components
│   │   ├── pages/           # Page-level components
│   │   ├── contexts/        # React contexts
│   │   ├── services/        # API and business logic
│   │   ├── hooks/           # Custom React hooks
│   │   ├── types/           # TypeScript definitions
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets
│   └── package.json
│
├── server/                  # Backend API (to be implemented)
│   ├── controllers/         # Request handlers
│   ├── models/              # Data models
│   ├── routes/              # API routes
│   ├── middleware/          # Express middleware
│   └── db/                  # Database migrations
│
├── tests/                   # Test suites
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── docs/                    # Documentation
├── CLAUDE.md                # AI assistant guide
└── README.md                # This file
```

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **Forms**: React Hook Form + Zod
- **State**: React Context + hooks
- **Maps**: Google Maps JavaScript API

### Backend (Planned)
- **Runtime**: Node.js 20 + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT tokens
- **File Storage**: AWS S3 / Cloudinary
- **Email/SMS**: SendGrid / Twilio

## 🎨 Features

### Implemented ✅
- [x] User authentication (login/register)
- [x] Multi-property dashboard
- [x] Property tabs with switching
- [x] Progress tracking with visual indicators
- [x] Responsive layout with header/footer
- [x] Protected routes
- [x] TypeScript type system
- [x] Tailwind CSS styling

### In Development 🚧
- [ ] Activity tracking and documentation
- [ ] Document upload and vault
- [ ] Filing wizard workflow
- [ ] Google Maps integration
- [ ] Calendar and scheduling
- [ ] Backend API
- [ ] Database integration
- [ ] AI document validation

### Planned 📋
- [ ] Role-based access control
- [ ] Billing and subscriptions
- [ ] Referral program
- [ ] Local supplier directory
- [ ] Email/SMS notifications
- [ ] Mobile app

## 📝 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run type checking
npm run type-check

# Run linter
npm run lint
```

### Environment Variables

Create a `.env` file in the client directory:

```env
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e

# Run all tests with coverage
npm run test:coverage
```

## 🚢 Deployment

### Frontend (Vercel/Netlify)

```bash
# Build the application
cd client
npm run build

# The dist/ folder is ready to deploy
```

### Backend (Coming Soon)

Instructions for deploying the Node.js backend will be added when implemented.

## 🤝 Contributing

1. Read `CLAUDE.md` for AI assistant guidelines and project conventions
2. Follow the existing code style and patterns
3. Write tests for new features
4. Update documentation as needed
5. Submit PRs with clear descriptions

### Code Style

- Use TypeScript strict mode
- Follow ESLint rules
- Use functional components and hooks
- Keep components small and focused
- Write self-documenting code

## 📚 Documentation

- **CLAUDE.md**: Comprehensive guide for AI assistants working on this project
- **docs/api/**: API documentation (coming soon)
- **docs/architecture/**: Architecture diagrams and decisions
- **docs/user-guides/**: End-user documentation

## 🔒 Security

- Never commit secrets or API keys
- Use environment variables for configuration
- Validate all user input
- Implement RBAC for access control
- Follow OWASP security best practices

## 📄 License

This project is proprietary software. All rights reserved.

## 🙋 Support

- Create an issue for bug reports
- Contact the maintainers for questions
- Check the docs folder for user guides

## 🗺️ Roadmap

### Q1 2025
- Complete frontend implementation
- Build backend API
- Implement database schema
- Launch beta testing

### Q2 2025
- AI document validation
- Google Maps integration
- Mobile responsive improvements
- User testing and feedback

### Q3 2025
- Billing and subscriptions
- Referral program
- Local supplier directory
- Production launch

## 👥 Team

- **Project Owner**: Katie Z. Sheridan
- **Development**: AI-assisted development with Claude

---

**Built with ❤️ for landowners managing wildlife tax exemptions**
