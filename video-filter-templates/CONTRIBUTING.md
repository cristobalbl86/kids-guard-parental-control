# Contributing to Video Filter

Thank you for your interest in contributing to Video Filter! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How to Contribute

### Reporting Bugs

Before creating a bug report:
1. Check the existing issues to avoid duplicates
2. Collect relevant information (OS, Node version, error messages)
3. Try to reproduce the bug with minimal steps

When creating a bug report, include:
- Clear, descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Environment details

### Suggesting Enhancements

Enhancement suggestions are welcome! Please:
1. Use a clear, descriptive title
2. Provide detailed description of the proposed feature
3. Explain why this enhancement would be useful
4. Include examples if applicable

### Pull Requests

#### Before Submitting

1. **Check existing PRs** to avoid duplicate work
2. **Discuss major changes** by opening an issue first
3. **Follow coding standards** established in the project
4. **Write tests** for new functionality
5. **Update documentation** as needed

#### PR Process

1. **Fork the repository** and create your branch from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clear, concise code
   - Follow existing code style
   - Add comments for complex logic
   - Keep changes focused and minimal

3. **Test your changes**
   ```bash
   npm test
   npm run lint
   ```

4. **Commit your changes**
   - Use clear, descriptive commit messages
   - Follow conventional commit format:
     ```
     type(scope): description
     
     [optional body]
     
     [optional footer]
     ```
   - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
   - Example: `feat(filters): add video blur filter`

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request**
   - Use the PR template
   - Link related issues
   - Describe what changes were made and why
   - Include screenshots for UI changes
   - Request review from maintainers

#### PR Requirements

All PRs must:
- ✅ Pass all CI checks
- ✅ Include tests for new functionality
- ✅ Maintain or improve code coverage
- ✅ Follow code style guidelines
- ✅ Have descriptive commit messages
- ✅ Include updated documentation if needed
- ✅ Be reviewed and approved by at least one maintainer
- ✅ Have all conversations resolved

#### After Submission

- Respond to review feedback promptly
- Make requested changes in new commits
- Re-request review after addressing feedback
- Keep your branch up to date with `main`

### Coding Standards

#### JavaScript/Node.js

- Use ES6+ features
- Use `const` and `let`, avoid `var`
- Use arrow functions where appropriate
- Use async/await over callbacks
- Follow ESLint configuration

#### Testing

- Write unit tests for all new functions
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Mock external dependencies
- Aim for high code coverage

Example:
```javascript
describe('VideoFilter', () => {
  it('should apply blur filter to video frame', () => {
    // Arrange
    const filter = new VideoFilter();
    const frame = createTestFrame();
    
    // Act
    const result = filter.applyBlur(frame);
    
    // Assert
    expect(result.isBlurred).toBe(true);
  });
});
```

#### Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for public APIs
- Update CHANGELOG.md for significant changes
- Include inline comments for complex logic

### Development Setup

1. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/video-filter.git
   cd video-filter
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a branch**
   ```bash
   git checkout -b feature/your-feature
   ```

4. **Make changes and test**
   ```bash
   npm test
   npm run lint
   ```

### Git Workflow

1. Keep your fork synced with upstream:
   ```bash
   git remote add upstream https://github.com/original-owner/video-filter.git
   git fetch upstream
   git merge upstream/main
   ```

2. Rebase your branch if needed:
   ```bash
   git rebase main
   ```

3. Squash commits if requested:
   ```bash
   git rebase -i HEAD~n
   ```

### Review Process

1. **Automated checks** run first (tests, linting, coverage)
2. **Code review** by at least one maintainer
3. **Discussion** of any concerns or suggestions
4. **Approval** once all requirements met
5. **Merge** by maintainer (usually squash merge)

### Getting Help

- Read the documentation thoroughly
- Check existing issues and discussions
- Ask questions in issue comments
- Be patient and respectful

## Recognition

Contributors will be recognized in:
- CHANGELOG.md for their contributions
- GitHub's contributor graph
- Release notes for significant contributions

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

Thank you for contributing to Video Filter! 🎉
