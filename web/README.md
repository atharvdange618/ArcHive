# ArcHive Chrome Extension

A Chrome browser extension that allows you to quickly save web pages to your ArcHive personal knowledge management system.

## Features

- **Quick Save**: Save the current webpage to your ArcHive collection with a single click
- **User Authentication**: Secure login with JWT-based authentication
- **Automatic Token Refresh**: Seamlessly handles token expiration and renewal
- **Persistent Sessions**: Stay logged in across browser sessions
- **Clean UI**: Simple, intuitive interface for quick interactions

## Installation

### From Source (Development)

1. Clone the ArcHive repository:

   ```bash
   git clone https://github.com/atharvdange618/ArcHive.git
   cd ArcHive/web
   ```

2. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the `web` folder from the ArcHive repository

3. The ArcHive extension icon should now appear in your Chrome toolbar

### From Chrome Web Store

_(Coming soon)_

## Usage

### First Time Setup

1. Click the ArcHive extension icon in your toolbar
2. Enter your email and password in the login form
3. Click "Login"

### Saving Pages

Once logged in:

1. Navigate to any webpage you want to save
2. Click the ArcHive extension icon
3. Click "Save Current Page"
4. You'll see a success message when the page is saved

The saved link will automatically:

- Extract metadata (title, description)
- Generate relevant tags using NLP
- Be accessible in your ArcHive mobile app and web dashboard

### Logout

Click the "Logout" button in the extension popup to sign out of your account.

## Configuration

### API Endpoint

The extension is configured to connect to:

```
https://api.archive.atharvdangedev.in/api
```

To use a different API endpoint (e.g., for local development), edit the `API_BASE` constant in [background.js](background.js):

```javascript
const API_BASE = "http://localhost:3000/api"; // Your local endpoint
```

## Architecture

### Files

- **manifest.json**: Extension configuration and permissions
- **popup.html**: Extension popup interface
- **popup.css**: Styling for the popup UI
- **popup.js**: Frontend logic for the popup (UI interactions)
- **background.js**: Background service worker (API requests, authentication)

### Authentication Flow

1. User enters credentials in popup
2. `popup.js` sends LOGIN message to background service worker
3. `background.js` makes API request to `/auth/login`
4. Access token and refresh token are stored in `chrome.storage.local`
5. All subsequent API requests include the access token
6. If access token expires (401 response), background worker automatically refreshes it using the refresh token

### Permissions

The extension requires the following permissions:

- `activeTab`: Access current tab URL for saving
- `tabs`: Query active tabs
- `storage`: Store authentication tokens locally
- `host_permissions`: Make API requests to ArcHive backend

## Development

### Making Changes

After modifying any files:

1. Go to `chrome://extensions/`
2. Click the refresh icon on the ArcHive extension card
3. Test your changes

### Debugging

- **Popup**: Right-click the extension icon → "Inspect popup"
- **Background Worker**: Go to `chrome://extensions/` → Click "Inspect views: service worker"

## Security Notes

- Credentials are only sent over HTTPS
- Access tokens are stored locally in Chrome's secure storage
- Tokens are automatically cleared on logout
- Password fields are cleared after successful login

## Troubleshooting

### "Login failed" Error

- Verify your email and password are correct
- Check that the backend API is running and accessible
- Ensure you have an active internet connection

### "Please login first" Message

- Your session may have expired
- Click the extension icon and log in again

### Extension Not Appearing

- Make sure you've enabled "Developer mode" in `chrome://extensions/`
- Try reloading the extension
- Check browser console for errors

## Related

- [Backend API](../backend/) - Hono + Bun server with MongoDB
- [Mobile App](../mobile/) - Expo/React Native mobile application
- [Project Documentation](../README.md) - Main project README

## License

Part of the ArcHive project. See main repository for license information.
