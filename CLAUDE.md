# CLAUDE.md - AI Assistant Guide for FieldFile

> **Last Updated**: 2025-12-17
> **Repository**: FieldFile
> **Purpose**: Comprehensive guide for AI assistants working with this codebase

## Table of Contents
- [Project Overview](#project-overview)
- [Codebase Structure](#codebase-structure)
- [Development Workflows](#development-workflows)
- [Key Conventions](#key-conventions)
- [Testing Guidelines](#testing-guidelines)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)

---

## Project Overview

### Purpose
FieldFile is a [TO BE DOCUMENTED] project focused on [TO BE DOCUMENTED].

### Tech Stack
- **Language**: [TO BE DOCUMENTED]
- **Framework**: [TO BE DOCUMENTED]
- **Build Tool**: [TO BE DOCUMENTED]
- **Package Manager**: [TO BE DOCUMENTED]
- **Testing Framework**: [TO BE DOCUMENTED]

### Key Dependencies
[TO BE DOCUMENTED - List major dependencies and their purposes]

---

## Codebase Structure

### Directory Layout
```
FieldFile/
├── src/                  # Source code
│   ├── components/       # Reusable components
│   ├── services/         # Business logic and API services
│   ├── utils/           # Utility functions and helpers
│   ├── types/           # Type definitions
│   └── config/          # Configuration files
├── tests/               # Test files
├── docs/                # Additional documentation
├── scripts/             # Build and utility scripts
└── public/              # Static assets
```

**Note**: This structure will be updated as the project evolves.

### Key Files
- `package.json` - Project metadata and dependencies
- `tsconfig.json` - TypeScript configuration (if applicable)
- `.gitignore` - Files to exclude from version control
- `README.md` - User-facing documentation

---

## Development Workflows

### Getting Started
1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd FieldFile
   ```

2. **Install dependencies**:
   ```bash
   [TO BE DOCUMENTED - e.g., npm install, yarn, pnpm install]
   ```

3. **Run development server**:
   ```bash
   [TO BE DOCUMENTED - e.g., npm run dev]
   ```

### Branch Strategy
- **Main Branch**: `main` - Production-ready code
- **Feature Branches**: `claude/[feature-name]-[session-id]` - For AI assistant development
- **Branch Naming**: Use descriptive names with session IDs for traceability

### Commit Conventions
Follow these commit message guidelines:
- **Format**: `<type>: <description>`
- **Types**:
  - `feat` - New feature
  - `fix` - Bug fix
  - `docs` - Documentation changes
  - `style` - Code style changes (formatting, etc.)
  - `refactor` - Code refactoring
  - `test` - Adding or updating tests
  - `chore` - Maintenance tasks

**Examples**:
```
feat: add user authentication system
fix: resolve null pointer in data processor
docs: update API documentation
refactor: simplify error handling logic
```

### Pull Request Process
1. **Create feature branch**: `git checkout -b claude/feature-name-session-id`
2. **Make changes**: Implement feature/fix with clear commits
3. **Push to remote**: `git push -u origin <branch-name>`
4. **Create PR**: Use GitHub CLI or web interface
5. **PR Description**: Include:
   - Summary of changes
   - Testing performed
   - Breaking changes (if any)
   - Related issues

---

## Key Conventions

### Code Style
- **Indentation**: [TO BE DOCUMENTED - e.g., 2 spaces, 4 spaces, tabs]
- **Line Length**: [TO BE DOCUMENTED - e.g., 80, 100, 120 characters]
- **Quotes**: [TO BE DOCUMENTED - e.g., single, double]
- **Semicolons**: [TO BE DOCUMENTED - e.g., required, optional]

### Naming Conventions
- **Files**: [TO BE DOCUMENTED - e.g., camelCase, kebab-case, PascalCase]
- **Variables**: [TO BE DOCUMENTED - e.g., camelCase]
- **Constants**: [TO BE DOCUMENTED - e.g., UPPER_SNAKE_CASE]
- **Classes**: [TO BE DOCUMENTED - e.g., PascalCase]
- **Functions**: [TO BE DOCUMENTED - e.g., camelCase, descriptive verbs]

### File Organization
- **One component per file**: Each component should have its own file
- **Co-locate related files**: Keep tests, styles, and components together
- **Index files**: Use index files for clean imports
- **Absolute imports**: Prefer absolute imports over relative when configured

### Error Handling
- **Always handle errors explicitly**: Don't use empty catch blocks
- **Provide context**: Include meaningful error messages
- **Log appropriately**: Use appropriate log levels (error, warn, info, debug)
- **User-facing errors**: Provide helpful, actionable error messages

### Security Best Practices
- **Input validation**: Always validate user input
- **Sanitize data**: Prevent XSS, SQL injection, command injection
- **Secrets management**: Never commit secrets, use environment variables
- **Authentication**: Implement proper auth checks
- **HTTPS**: Use secure connections for sensitive data

---

## Testing Guidelines

### Test Structure
```
describe('ComponentName', () => {
  it('should handle expected behavior', () => {
    // Arrange
    // Act
    // Assert
  });
});
```

### Testing Principles
- **Write tests first**: TDD when appropriate
- **Test behavior, not implementation**: Focus on what, not how
- **Keep tests simple**: One assertion per test when possible
- **Use descriptive names**: Test names should explain the scenario
- **Mock external dependencies**: Isolate unit tests

### Running Tests
```bash
[TO BE DOCUMENTED - e.g., npm test, yarn test]
```

### Test Coverage
- **Target**: Aim for [TO BE DOCUMENTED]% coverage
- **Critical paths**: 100% coverage for critical business logic
- **Check coverage**: [TO BE DOCUMENTED - e.g., npm run coverage]

---

## Common Tasks

### Adding a New Feature
1. **Read existing code**: Understand current patterns
2. **Plan implementation**: Use TodoWrite to track tasks
3. **Write tests**: Create tests for new functionality
4. **Implement feature**: Follow existing conventions
5. **Update documentation**: Update CLAUDE.md and README.md if needed
6. **Commit and push**: Use proper commit messages

### Fixing a Bug
1. **Reproduce the bug**: Understand the issue
2. **Write a failing test**: Capture the bug in a test
3. **Fix the bug**: Make minimal changes
4. **Verify fix**: Ensure test passes
5. **Check for regressions**: Run full test suite
6. **Commit with context**: Reference issue number if applicable

### Refactoring Code
1. **Ensure tests exist**: Have good test coverage first
2. **Make small changes**: Incremental refactoring
3. **Run tests frequently**: After each change
4. **Don't change behavior**: Refactoring shouldn't change functionality
5. **Update documentation**: If interfaces change

### Updating Dependencies
1. **Check changelog**: Review breaking changes
2. **Update one at a time**: Easier to track issues
3. **Run tests**: Ensure nothing breaks
4. **Update code**: Fix any breaking changes
5. **Test thoroughly**: Manual testing for major updates

---

## AI Assistant Best Practices

### Before Making Changes
- ✅ **Read files first**: Always read code before modifying
- ✅ **Understand context**: Review related files and dependencies
- ✅ **Check existing patterns**: Follow established conventions
- ✅ **Plan with TodoWrite**: Track complex tasks

### During Implementation
- ✅ **Make minimal changes**: Don't over-engineer
- ✅ **Follow conventions**: Maintain consistency
- ✅ **Write secure code**: Validate inputs, handle errors
- ✅ **Add tests**: Test new functionality
- ✅ **Update todos**: Mark tasks as completed

### After Changes
- ✅ **Run tests**: Verify nothing breaks
- ✅ **Check formatting**: Follow code style
- ✅ **Update docs**: Keep documentation current
- ✅ **Commit clearly**: Descriptive commit messages
- ✅ **Clean up**: Remove unused code

### What to Avoid
- ❌ **Don't guess file contents**: Always read files first
- ❌ **Don't over-engineer**: Keep it simple
- ❌ **Don't skip tests**: Testing is crucial
- ❌ **Don't commit secrets**: Check for sensitive data
- ❌ **Don't break conventions**: Follow existing patterns
- ❌ **Don't add unnecessary features**: Stick to requirements
- ❌ **Don't skip error handling**: Handle edge cases

---

## Troubleshooting

### Common Issues

#### Build Failures
1. **Clear cache**: [TO BE DOCUMENTED]
2. **Reinstall dependencies**: [TO BE DOCUMENTED]
3. **Check Node version**: [TO BE DOCUMENTED]
4. **Review error logs**: Look for specific error messages

#### Test Failures
1. **Run single test**: Isolate the failing test
2. **Check test data**: Verify test fixtures
3. **Review recent changes**: What changed?
4. **Clear test cache**: [TO BE DOCUMENTED]

#### Git Issues
1. **Branch conflicts**: Use `git status` to identify conflicts
2. **Push failures**: Ensure branch name matches pattern `claude/*-sessionid`
3. **Detached HEAD**: `git checkout <branch-name>`

#### Network Issues (Git Operations)
- **Retry logic**: Git operations retry up to 4 times with exponential backoff (2s, 4s, 8s, 16s)
- **Fetch/Pull**: Use `git fetch origin <branch-name>` for specific branches
- **Push**: Always use `git push -u origin <branch-name>`

---

## Documentation Maintenance

### When to Update This File
- **Project structure changes**: New directories, reorganization
- **New conventions adopted**: Coding standards, naming patterns
- **Tech stack changes**: Framework updates, new tools
- **Workflow changes**: New processes, branch strategies
- **Common issues identified**: Add to troubleshooting

### How to Update
1. **Read current version**: Understand existing documentation
2. **Make targeted changes**: Update only what changed
3. **Keep formatting consistent**: Follow existing structure
4. **Update timestamp**: Change "Last Updated" date
5. **Commit with message**: `docs: update CLAUDE.md with [changes]`

---

## Project-Specific Notes

### Architecture Decisions
[TO BE DOCUMENTED - Document key architectural decisions and rationale]

### Performance Considerations
[TO BE DOCUMENTED - Performance-critical areas, optimization guidelines]

### Accessibility Requirements
[TO BE DOCUMENTED - A11y standards, WCAG compliance level]

### Browser/Platform Support
[TO BE DOCUMENTED - Supported browsers, versions, platforms]

### API Integration
[TO BE DOCUMENTED - External APIs, authentication, rate limits]

### Deployment Process
[TO BE DOCUMENTED - Build process, deployment targets, CI/CD]

---

## Additional Resources

### Documentation
- **README.md**: User-facing project documentation
- **API Docs**: [TO BE DOCUMENTED]
- **Component Library**: [TO BE DOCUMENTED]
- **Style Guide**: [TO BE DOCUMENTED]

### External Links
- **GitHub Repository**: [TO BE DOCUMENTED]
- **Issue Tracker**: [TO BE DOCUMENTED]
- **Project Board**: [TO BE DOCUMENTED]
- **Documentation Site**: [TO BE DOCUMENTED]

### Team Contacts
[TO BE DOCUMENTED - Team members, roles, contact info if applicable]

---

## Quick Reference

### Essential Commands
```bash
# Install dependencies
[TO BE DOCUMENTED]

# Run development server
[TO BE DOCUMENTED]

# Run tests
[TO BE DOCUMENTED]

# Build for production
[TO BE DOCUMENTED]

# Lint code
[TO BE DOCUMENTED]

# Format code
[TO BE DOCUMENTED]
```

### File Locations
- **Configuration**: [TO BE DOCUMENTED]
- **Environment Variables**: [TO BE DOCUMENTED]
- **Build Output**: [TO BE DOCUMENTED]
- **Test Files**: [TO BE DOCUMENTED]

---

## Version History

### 2025-12-17
- Initial CLAUDE.md creation
- Established base structure and conventions template
- Set up documentation framework for future updates

---

**Note to AI Assistants**: This is a living document. As you work with the codebase, update this file to reflect current practices, patterns, and conventions. Keep it accurate and helpful for future AI assistants and human developers.
