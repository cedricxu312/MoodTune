# MoodTune Frontend

A modern, responsive React frontend for the MoodTune application that provides an intuitive interface for mood-based music discovery and playlist creation.

## 🏗️ Architecture

The frontend follows a clean, component-based architecture with clear separation of concerns:

```
client/src/
├── api/           # API service layer
├── components/    # Reusable UI components
├── pages/         # Page-level components
├── styles/        # Global styles and CSS
├── App.jsx        # Main application component
└── index.js       # Application entry point
```

## 🚀 Features

- **Modern React**: Built with React 18+ and modern hooks
- **Responsive Design**: Mobile-first approach with beautiful UI
- **Voice Input**: Speech recognition for hands-free mood input
- **Real-time Updates**: Live feedback during mood processing
- **Spotify Integration**: Seamless playlist creation
- **Guest Mode**: Use without creating an account
- **Authentication**: JWT-based user management

## 📋 Prerequisites

- Node.js 16+
- npm or yarn
- Backend server running (see server README)

## 🔧 Environment Setup

Create a `.env` file in the client root with:

```env
# Backend API URL
REACT_APP_BACKEND_URL=http://localhost:3001

# Optional: Analytics and monitoring
REACT_APP_ANALYTICS_ID=your-analytics-id
```

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## 🏛️ Component Structure

### Core Components

#### `App.jsx`
- **Purpose**: Main application component and routing
- **Features**: 
  - Authentication state management
  - Route handling
  - Guest mode functionality
  - Landing page for unauthenticated users

#### `MoodForm.jsx`
- **Purpose**: Core mood input and processing interface
- **Features**:
  - Text and voice input for moods
  - Real-time feedback during processing
  - Spotify playlist creation
  - Error handling and validation

#### `TrackList.jsx`
- **Purpose**: Display recommended tracks
- **Features**:
  - Responsive grid layout
  - Track information display
  - Spotify integration links

#### `MoodHistory.jsx`
- **Purpose**: Show user's mood and track history
- **Features**:
  - Chronological mood listing
  - Track details for each mood
  - Delete functionality

#### `AuthForm.jsx`
- **Purpose**: User authentication interface
- **Features**:
  - Login and signup forms
  - Form validation
  - Error handling

#### `NavBar.jsx`
- **Purpose**: Navigation and user controls
- **Features**:
  - Responsive navigation menu
  - User profile information
  - Logout functionality

### Page Components

#### `Home.jsx`
- **Purpose**: Main dashboard page
- **Features**:
  - Welcome message
  - Quick mood input
  - Recent activity

#### `MoodSearch.jsx`
- **Purpose**: Dedicated mood search interface
- **Features**:
  - Full-featured mood form
  - Track recommendations
  - Playlist creation

#### `About.jsx`
- **Purpose**: Application information
- **Features**:
  - Feature descriptions
  - Technology stack
  - Team information

#### `Contact.jsx`
- **Purpose**: Contact and support information
- **Features**:
  - Contact details
  - Support information
  - Feedback form

## 🔌 API Integration

### API Service Layer

The frontend communicates with the backend through a well-structured API layer:

#### `api.js` - Base Configuration
- Axios instance with interceptors
- Automatic token management
- Error handling and timeouts
- Request/response logging

#### `authApi.js` - Authentication
- User login and registration
- Token management
- Profile operations
- Comprehensive error handling

#### `moodApi.js` - Mood Operations
- Mood submission and processing
- History retrieval
- Mood management (CRUD operations)
- User-friendly error messages

### API Features

- **Automatic Authentication**: JWT tokens automatically added to requests
- **Error Handling**: User-friendly error messages for all API failures
- **Timeout Management**: Configurable request timeouts
- **Retry Logic**: Automatic retry for failed requests
- **Status Handling**: Proper handling of HTTP status codes

## 🎨 Styling and UI

### Design System

- **Color Palette**: Consistent color scheme throughout the app
- **Typography**: Modern, readable font stack
- **Spacing**: Consistent spacing system using rem units
- **Animations**: Smooth transitions and micro-interactions

### Responsive Design

- **Mobile First**: Designed for mobile devices first
- **Breakpoints**: Responsive breakpoints for all screen sizes
- **Touch Friendly**: Optimized for touch interactions
- **Accessibility**: WCAG compliant design patterns

## 🔐 Authentication Flow

### Guest Mode
1. Users can access basic features without an account
2. Mood processing works for anonymous users
3. No personal data is stored
4. Easy upgrade to full account

### User Authentication
1. **Login**: Email/username + password
2. **Registration**: Email, username, and password
3. **JWT Tokens**: Secure, stateless authentication
4. **Auto-logout**: Automatic logout on token expiration

### Security Features
- Secure token storage
- Automatic token refresh
- Protected route handling
- Input validation and sanitization

## 🎵 Spotify Integration

### Playlist Creation Flow
1. User processes mood and gets recommendations
2. Clicks "Create Spotify Playlist" button
3. OAuth popup opens for Spotify authorization
4. Playlist is created with recommended tracks
5. User receives confirmation and direct link

### Technical Implementation
- OAuth 2.0 flow with Spotify
- Popup-based authentication
- PostMessage communication
- Error handling for OAuth failures

## 🧪 Testing and Development

### Development Tools
- **React Developer Tools**: Component inspection
- **Redux DevTools**: State management debugging
- **Network Tab**: API call monitoring
- **Console Logging**: Comprehensive error logging

### Code Quality
- **ESLint**: Code linting and formatting
- **Prettier**: Automatic code formatting
- **PropTypes**: Runtime prop validation
- **JSDoc**: Comprehensive documentation

## 🚀 Performance Optimization

### Best Practices
- **Code Splitting**: Lazy loading of routes
- **Memoization**: React.memo for expensive components
- **Bundle Optimization**: Tree shaking and minification
- **Image Optimization**: Optimized asset loading

### Monitoring
- **Performance Metrics**: Core Web Vitals tracking
- **Error Tracking**: Comprehensive error monitoring
- **User Analytics**: Usage pattern analysis
- **Performance Budgets**: Bundle size monitoring

## 🔧 Configuration

### Environment Variables
- `REACT_APP_BACKEND_URL`: Backend API endpoint
- `REACT_APP_ANALYTICS_ID`: Analytics tracking ID
- `REACT_APP_ENVIRONMENT`: Environment (development/production)

### Build Configuration
- **Webpack**: Custom webpack configuration
- **Babel**: Modern JavaScript support
- **PostCSS**: Advanced CSS processing
- **Optimization**: Production build optimization

## 🚨 Error Handling

### User Experience
- **Friendly Messages**: Clear, actionable error messages
- **Fallback UI**: Graceful degradation on errors
- **Retry Mechanisms**: Automatic retry for recoverable errors
- **Error Boundaries**: React error boundary implementation

### Developer Experience
- **Console Logging**: Detailed error logging
- **Error Tracking**: Centralized error monitoring
- **Debug Information**: Helpful debugging context
- **Stack Traces**: Full error stack traces in development

## 📱 Browser Support

### Supported Browsers
- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

### Feature Detection
- **Speech Recognition**: Graceful fallback for unsupported browsers
- **Modern APIs**: Progressive enhancement approach
- **Polyfills**: Automatic polyfill loading when needed

## 🤝 Contributing

### Development Guidelines
1. **Component Structure**: Follow established patterns
2. **State Management**: Use appropriate React hooks
3. **Error Handling**: Implement comprehensive error handling
4. **Documentation**: Add JSDoc comments for all functions
5. **Testing**: Write tests for new features

### Code Style
- **ES6+**: Use modern JavaScript features
- **Functional Components**: Prefer functional components with hooks
- **Consistent Naming**: Follow established naming conventions
- **Clean Code**: Write readable, maintainable code

## 📄 License

This project is part of the MoodTune application.

## 🔗 Related Documentation

- [Backend API Documentation](../server/README.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [API Reference](./API_REFERENCE.md)
- [Component Library](./COMPONENTS.md)
