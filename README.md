# 🚀 Terabox Downloader

[![CI - Testing & Validation](https://github.com/yourusername/terabox-downloader/actions/workflows/ci-testing.yml/badge.svg)](https://github.com/yourusername/terabox-downloader/actions/workflows/ci-testing.yml)
[![CD - Deploy to Netlify](https://github.com/yourusername/terabox-downloader/actions/workflows/cd-deploy.yml/badge.svg)](https://github.com/yourusername/terabox-downloader/actions/workflows/cd-deploy.yml)
[![Security Scan](https://github.com/yourusername/terabox-downloader/actions/workflows/security-scan.yml/badge.svg)](https://github.com/yourusername/terabox-downloader/actions/workflows/security-scan.yml)

A modern, fast, and reliable web application to download files from Terabox without requiring a login. Built with React, TypeScript, Node.js, and complete CI/CD pipeline using GitHub Actions.

## ✨ Features

- 📁 **Download Files & Folders** - Support for both individual files and entire folders
- 🔓 **No Login Required** - Download files without Terabox account
- ⚡ **Fast Downloads** - Get direct download links without speed limits
- 🔒 **Secure** - Built with security best practices
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🎨 **Modern UI** - Beautiful interface with dark mode support
- 🧪 **Fully Tested** - Comprehensive test suite with CI/CD

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (Build Tool)
- Tailwind CSS
- shadcn/ui Components
- Lucide Icons

### Backend
- Node.js + Express
- Axios (HTTP Client)
- Cheerio (HTML Parsing)
- Jest (Testing)
- ESLint (Linting)

### DevOps
- GitHub Actions (CI/CD)
- Netlify (Hosting)
- Snyk (Security Scanning)
- CodeQL (Code Analysis)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/terabox-downloader.git
cd terabox-downloader
```

2. Install all dependencies:
```bash
npm run install:all
```

3. Set up environment variables:
```bash
# Frontend
cp .env.example .env

# Backend
cp backend/.env.example backend/.env
```

4. Start development servers:
```bash
# Start both frontend and backend
npm run start:dev

# Or start separately
npm run dev          # Frontend only
cd backend && npm run dev  # Backend only
```

5. Open http://localhost:5173 in your browser

## 📝 Usage

1. Copy a Terabox share link (e.g., `https://teraboxapp.com/s/1AAAAAA`)
2. Paste the link in the input field
3. Enter password if the link is protected
4. Click "Get Info" to see file details
5. Click "Get All Download Links" or individual download buttons
6. Copy or click download links to save files

## 🧪 Testing

### Run All Tests
```bash
npm run test:all
```

### Backend Tests Only
```bash
cd backend && npm test
```

### With Coverage
```bash
cd backend && npm test -- --coverage
```

## 🔄 CI/CD Pipeline

### Workflows

1. **CI - Testing & Validation** (`.github/workflows/ci-testing.yml`)
   - Runs on push to `main`/`develop` and PRs
   - Backend unit and API integration tests
   - Frontend build validation
   - Security audit
   - Code linting
   - Quality gate check

2. **CD - Deploy to Netlify** (`.github/workflows/cd-deploy.yml`)
   - Triggers after CI passes on `main`
   - Builds and deploys to Netlify
   - Post-deployment smoke tests
   - Automatic rollback on failure
   - Slack notifications

3. **Environment Setup** (`.github/workflows/environment-setup.yml`)
   - Manual workflow dispatch
   - Configures staging/production environments
   - Validates configuration
   - Runs smoke tests

4. **Security Scan** (`.github/workflows/security-scan.yml`)
   - Weekly scheduled scans
   - Snyk vulnerability scanning
   - Dependency review
   - CodeQL analysis
   - Secret detection

### Required Secrets

Configure these secrets in your GitHub repository:

| Secret | Description |
|--------|-------------|
| `NETLIFY_AUTH_TOKEN` | Netlify authentication token |
| `NETLIFY_SITE_ID` | Netlify site ID |
| `SNYK_TOKEN` | Snyk API token |
| `SLACK_WEBHOOK_URL` | Slack webhook for notifications |

## 📁 Project Structure

```
terabox-downloader/
├── .github/
│   └── workflows/          # GitHub Actions workflows
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── routes/         # API routes
│   │   └── server.js       # Express server
│   ├── tests/              # Test files
│   ├── package.json
│   └── .env.example
├── src/
│   ├── components/         # React components
│   ├── sections/           # Page sections
│   ├── hooks/              # Custom hooks
│   ├── types/              # TypeScript types
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
├── public/                 # Static assets
├── dist/                   # Build output
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## 🔒 Security

- Helmet.js for security headers
- Express Rate Limit for API protection
- CORS configuration
- Input validation
- Regular security scans with Snyk
- Dependency vulnerability monitoring
- CodeQL static analysis

## 🚀 Deployment

### Netlify (Recommended)

1. Connect your GitHub repo to Netlify
2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Add environment variables
4. Deploy!

### Manual Deployment

```bash
# Build for production
npm run build

# Deploy backend
cd backend
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This tool is for educational purposes only. Users are responsible for complying with Terabox's Terms of Service and applicable laws. The developers assume no liability for misuse.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Lucide](https://lucide.dev/) for icons
- [Netlify](https://netlify.com/) for hosting
- [GitHub Actions](https://github.com/features/actions) for CI/CD

## 📞 Support

If you found this project helpful, please give it a ⭐ on GitHub!

For issues and feature requests, please use the [GitHub Issues](https://github.com/yourusername/terabox-downloader/issues) page.

---

Made with ❤️ by [Your Name](https://github.com/yourusername)
