# Contributing to Jp7an-timing

## Development Setup

1. Fork and clone the repository
2. Follow the setup instructions in README.md
3. Create a feature branch: `git checkout -b feature/my-feature`
4. Make your changes
5. Test thoroughly
6. Commit with clear messages
7. Push and create a Pull Request

## Code Style

### TypeScript/JavaScript
- Use TypeScript for type safety
- Follow existing code formatting
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused

### React/Next.js
- Use functional components with hooks
- Keep components focused and reusable
- Use proper TypeScript types for props
- Follow Next.js 14 App Router conventions

### CSS
- Use the existing design system (globals.css)
- Follow the color scheme (black/white/orange)
- Make responsive designs
- Use CSS classes from globals.css

## Testing

### Backend
```bash
cd apps/api
npm run lint
npm run build
npm test
```

### Frontend
```bash
cd apps/web
npm run lint
npm run build
npm test
```

## Database Changes

When modifying the database schema:

1. Update `apps/api/prisma/schema.prisma`
2. Generate Prisma client: `npx prisma generate`
3. Push to database: `npx prisma db push`
4. Update seed script if needed
5. Test migrations

## Adding New Features

### New Race Mode
1. Create mode calculator in `apps/api/src/modes/`
2. Implement `RaceModeCalculator` interface
3. Add to `getModeCalculator()` in `modes/index.ts`
4. Update frontend to handle new mode
5. Add tests

### New API Endpoint
1. Create route handler in `apps/api/src/routes/`
2. Add authentication if needed
3. Update API client in `apps/web/src/lib/api.ts`
4. Document endpoint in README.md

### New Frontend Page
1. Create page in `apps/web/src/app/`
2. Use existing components and utilities
3. Follow design system
4. Add to navigation if public page

## Commit Messages

Use clear, descriptive commit messages:
- `feat: Add Varvlopp mode calculator`
- `fix: Correct EPC duplicate detection`
- `docs: Update API documentation`
- `style: Format code with prettier`
- `refactor: Simplify results calculation`
- `test: Add tests for participant registration`

## Pull Request Process

1. Update README.md with any new features
2. Ensure all tests pass
3. Update documentation as needed
4. Request review from maintainers
5. Address review feedback
6. Merge after approval

## Questions?

Create an issue for:
- Bug reports
- Feature requests
- Documentation improvements
- General questions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
