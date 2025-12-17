# CLAUDE.md - AI Assistant Guide for FieldFile

**Last Updated**: 2025-12-17
**Repository**: katiezsheridan/FieldFile
**Status**: Initial repository setup

---

## Overview

This document serves as a comprehensive guide for AI assistants (Claude and others) working on the FieldFile codebase. It outlines the repository structure, development workflows, conventions, and best practices that should be followed.

---

## Repository Status

This repository is in its initial setup phase. As the codebase grows, this document should be updated to reflect:
- Project purpose and domain
- Technology stack and frameworks
- Architecture patterns and design decisions
- Key modules and their responsibilities

---

## Project Structure

```
FieldFile/
├── CLAUDE.md           # This file - AI assistant guide
└── .git/               # Git version control
```

### Expected Structure (To be populated as project grows)

```
FieldFile/
├── src/                # Source code
├── tests/              # Test files
├── docs/               # Documentation
├── config/             # Configuration files
├── scripts/            # Build and utility scripts
├── .github/            # GitHub workflows and templates
├── CLAUDE.md           # AI assistant guide
├── README.md           # Project documentation
└── package.json        # Dependencies (if Node.js project)
```

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

### To Be Determined

As the project evolves, document:
- Programming language(s)
- Frameworks and libraries
- Database systems
- Testing frameworks
- Build tools
- CI/CD pipeline
- Deployment strategy

---

## Architecture Patterns

### To Be Documented

Document architectural decisions as they are made:
- Design patterns used
- Module organization
- Data flow
- API design principles
- Error handling strategies
- Logging and monitoring

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

- **2025-12-17**: Initial CLAUDE.md creation for empty repository
  - Established basic structure and conventions
  - Defined git workflows and branch strategy
  - Set code quality standards and security practices
  - Created template sections for future documentation

---

## Contact and Support

For questions about this document or the project:
- Create an issue in the repository
- Contact project maintainers
- Refer to the main README.md (once created)

---

*This document is a living guide and should evolve with the project. All contributors and AI assistants should keep it updated and relevant.*
