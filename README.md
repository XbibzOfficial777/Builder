# WebToApk Builder

Convert any website to Android APK using GitHub Actions! This tool provides a simple web interface to configure and build Android WebView apps.

![WebToApk Builder](https://img.shields.io/badge/WebToApk-Builder-blue)
![GitHub Actions](https://img.shields.io/badge/GitHub-Actions-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## Features

- **Easy Configuration**: Simple web form to customize your APK
- **Custom App Name**: Name your app anything you want
- **Custom Icon**: Use your own app icon
- **Version Control**: Manage app versions easily
- **GitHub Actions Backend**: Free, reliable cloud building
- **Signed APK**: Output is ready to install or distribute
- **WebView Features**:
  - Pull-to-refresh
  - Back button navigation
  - Progress indicator
  - Full JavaScript support
  - Local storage support

## Quick Start

### 1. Fork This Repository

Click the "Fork" button at the top right of this page to create your own copy.

### 2. Enable GitHub Pages

1. Go to your forked repository settings
2. Navigate to "Pages" section
3. Select "GitHub Actions" as the source
4. The site will be published automatically

### 3. Create GitHub Personal Access Token

1. Go to [GitHub Settings > Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select the following scopes:
   - `repo` - Full control of private repositories
   - `workflow` - Update GitHub Action workflows
4. Copy the generated token

### 4. Use the Builder

1. Open your published GitHub Pages site
2. Fill in the required information:
   - **Website URL**: The website you want to convert
   - **App Name**: Your app's display name
   - **Package Name**: Unique identifier (e.g., com.yourcompany.app)
   - **App Version**: Semantic version (e.g., 1.0.0)
   - **GitHub Token**: Your personal access token
   - **Repository**: Your forked repo (username/repo-name)
3. Click "Build APK"
4. Wait for the build to complete
5. Download your APK from GitHub Actions artifacts

## Configuration Options

### Basic Settings

| Field | Description | Required |
|-------|-------------|----------|
| Website URL | URL of the website to convert | Yes |
| App Name | Display name of your app | Yes |
| App Version | Version number (e.g., 1.0.0) | Yes |
| Icon URL | URL to your app icon (PNG recommended) | No |

### Advanced Settings

| Field | Description | Default |
|-------|-------------|---------|
| Package Name | Unique app identifier | com.webtoapk.app |
| Version Code | Integer version for updates | 1 |

### GitHub Settings

| Field | Description | Required |
|-------|-------------|----------|
| Repository | Your GitHub repo (owner/repo) | Yes |
| Token | GitHub Personal Access Token | Yes |

## How It Works

1. **Frontend**: React-based web interface for configuration
2. **GitHub Actions**: Automated build pipeline
3. **Android Template**: Pre-configured WebView project
4. **Output**: Signed APK ready for distribution

### Build Process

```
User Input → GitHub API → GitHub Actions → Build APK → Release/Artifacts
```

## Project Structure

```
.
├── .github/
│   └── workflows/
│       └── build-apk.yml    # GitHub Actions workflow
├── android-template/         # Android project template
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── java/com/webtoapk/app/
│   │   │   │   └── MainActivity.java
│   │   │   ├── res/
│   │   │   └── AndroidManifest.xml
│   │   └── build.gradle
│   ├── build.gradle
│   └── gradle/
├── src/                      # React frontend source
├── public/
└── index.html
```

## Customization

### Modifying the Android Template

You can customize the Android app by editing files in `android-template/`:

- **MainActivity.java**: Modify WebView behavior
- **AndroidManifest.xml**: Change app permissions
- **build.gradle**: Update dependencies or SDK versions

### Adding Features

Common customizations:

```java
// Enable geolocation
webSettings.setGeolocationEnabled(true);

// Custom user agent
webSettings.setUserAgentString("MyCustomApp/1.0");

// Handle file uploads
webView.setWebChromeClient(new WebChromeClient() {
    // Override onShowFileChooser
});
```

## Troubleshooting

### Build Fails

1. Check GitHub Actions logs for errors
2. Verify your token has correct permissions
3. Ensure repository name format is correct (owner/repo)

### App Shows Blank Screen

1. Check if website allows iframe embedding
2. Verify website URL is accessible
3. Check for JavaScript errors in WebView

### Icon Not Showing

1. Ensure icon URL is publicly accessible
2. Use PNG format for best compatibility
3. Recommended size: 512x512 pixels

## Security Notes

- Keep your GitHub token private
- Don't commit tokens to the repository
- Use environment variables for sensitive data
- Review GitHub Actions permissions

## Requirements

- GitHub account
- Personal Access Token with `repo` scope
- Website URL to convert

## Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: GitHub Actions
- **Android**: Java, Android SDK, WebView

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

If you find this project helpful, please give it a ⭐ on GitHub!

## Roadmap

- [ ] Support for custom CSS/JS injection
- [ ] Push notification support
- [ ] Offline mode with service workers
- [ ] Custom splash screen
- [ ] App signing with custom keystore
- [ ] Play Store publishing guide
