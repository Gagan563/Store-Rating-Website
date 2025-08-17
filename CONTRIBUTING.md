# Contributing to Store Rating Website

Thank you for considering contributing to the Store Rating Website! This document provides guidelines and information for contributors.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Store-Rating-Website.git
   cd Store-Rating-Website
   ```
3. **Set up the development environment** following the README.md instructions

## 🛠️ Development Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Git

### Installation
1. Install backend dependencies:
   ```bash
   cd backend-folder/backend
   npm install
   ```

2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

3. Copy environment file:
   ```bash
   cp .env.example backend-folder/backend/.env
   ```

## 📝 Making Changes

### Branch Naming Convention
- `feature/description` - for new features
- `bugfix/description` - for bug fixes
- `docs/description` - for documentation updates
- `refactor/description` - for code refactoring

### Commit Message Format
Use conventional commits format:
- `feat: add new store search functionality`
- `fix: resolve rating submission error`
- `docs: update API documentation`
- `style: improve responsive design`

### Code Style
- **Frontend**: Follow React/TypeScript best practices
- **Backend**: Follow Node.js/Express conventions
- **Formatting**: Use Prettier for consistent formatting
- **Linting**: Ensure ESLint passes without errors

## 🧪 Testing

Before submitting a pull request:

1. **Test the application manually**:
   - Start both frontend and backend servers
   - Test user registration and login
   - Test rating submission and editing
   - Test admin dashboard functionality

2. **Check for errors**:
   - No console errors in browser
   - No server errors in terminal
   - Database operations work correctly

## 📋 Pull Request Process

1. **Update documentation** if needed
2. **Test your changes** thoroughly
3. **Create a pull request** with:
   - Clear title describing the change
   - Detailed description of what was changed
   - Screenshots if UI changes were made
   - Link to any related issues

### Pull Request Template
```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Code refactoring

## Testing
- [ ] Manual testing completed
- [ ] No console errors
- [ ] Database operations work
- [ ] All user flows tested

## Screenshots (if applicable)
Add screenshots here

## Related Issues
Closes #[issue_number]
```

## 🐛 Bug Reports

When reporting bugs, please include:
- **Clear title** describing the issue
- **Steps to reproduce** the problem
- **Expected behavior**
- **Actual behavior**
- **Screenshots** if applicable
- **Environment details** (OS, browser, Node.js version)

## 💡 Feature Requests

For new features:
- **Describe the feature** clearly
- **Explain the use case** and benefits
- **Provide mockups** or examples if possible
- **Consider implementation** complexity

## 🤝 Code of Conduct

- Be respectful and inclusive
- Help others learn and grow
- Focus on constructive feedback
- Follow project guidelines

## 📞 Getting Help

- **Issues**: Create a GitHub issue for bugs or questions
- **Discussions**: Use GitHub Discussions for general questions
- **Documentation**: Check README.md for setup instructions

## 🏗️ Project Structure

```
Store-Rating-Website/
├── frontend/                # Next.js frontend
│   ├── app/                # App router pages
│   ├── components/         # Reusable components
│   ├── lib/               # Utility functions
│   └── public/            # Static assets
├── backend-folder/backend/ # Express.js backend
│   ├── server.js          # Main server file
│   └── package.json       # Backend dependencies
├── .env.example           # Environment template
├── README.md              # Project documentation
└── CONTRIBUTING.md        # This file
```

## 📚 Useful Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Express.js Documentation](https://expressjs.com)
- [SQLite Documentation](https://sqlite.org/docs.html)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

Thank you for contributing! 🎉
