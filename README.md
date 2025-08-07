# 🔐 SecureChat - Ultra-Secure Self-Destructing Chat App

<div align="center">

![SecureChat Logo](https://img.shields.io/badge/SecureChat-Ultra--Secure-purple?style=for-the-badge&logo=shield&logoColor=white)

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Encore.ts](https://img.shields.io/badge/Encore.ts-Backend-green?style=for-the-badge)](https://encore.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**A privacy-focused, ephemeral messaging platform with military-grade security features**

[🚀 Live Demo](#) • [📖 Documentation](#features) • [🛠️ Installation](#installation) • [🔒 Security](#security-features)

</div>

---

## 🎯 Overview

SecureChat is an ultra-secure, self-destructing chat application designed for privacy-conscious users who need to communicate sensitive information safely. Built with modern web technologies and security-first principles, it provides ephemeral messaging with automatic data destruction and end-to-end encryption.

### ✨ Key Highlights

- 🔐 **Password-Protected Rooms** - Each chat room requires a unique password
- 🔒 **End-to-End Encryption** - Client-side AES-256-GCM encryption
- ⏰ **Self-Destructing Messages** - Messages automatically delete after 10 minutes of being read
- 🛑 **Regret Button** - Delete messages within 3 seconds for everyone
- 👻 **Anonymous Communication** - Random nicknames and avatars for complete anonymity
- 📱 **Fully Responsive** - Works seamlessly on mobile, tablet, and desktop
- 🚨 **Panic Mode** - Emergency exit feature for instant data clearing
- 📊 **QR Code Sharing** - Easy room sharing via QR codes
- 🔍 **Invisible Mode** - Hide messages until hovered for extra privacy
- 📵 **Screenshot Detection** - Advanced detection and warning system
- 😀 **Emoji Support** - Rich emoji picker with categorized selection

---

## 🚀 Features

### 🔒 Core Security Features

| Feature | Description | Status |
|---------|-------------|--------|
| **End-to-End Encryption** | Client-side AES-256-GCM encryption | ✅ |
| **Password Protection** | Secure room access with PBKDF2 hashing | ✅ |
| **Message Expiration** | Auto-delete after 10 minutes of reading | ✅ |
| **Regret Button** | Delete messages within 3 seconds for everyone | ✅ |
| **Session Cleanup** | Data cleared on tab close/refresh | ✅ |
| **Anonymous Users** | Random nicknames and emoji avatars | ✅ |
| **Secure Storage** | PostgreSQL with automatic cleanup | ✅ |
| **Screenshot Detection** | Multi-method screenshot detection system | ✅ |
| **Participant Limits** | Configurable room capacity (2-50 users) | ✅ |

### 🛡️ Advanced Security Features

| Feature | Description | Status |
|---------|-------------|--------|
| **Invisible Mode** | Hide messages until user interaction | ✅ |
| **Panic Button** | Emergency exit with data clearing | ✅ |
| **QR Code Sharing** | Secure room sharing mechanism | ✅ |
| **Input Validation** | Comprehensive server-side validation | ✅ |
| **Rate Limiting** | Protection against brute force attacks | ✅ |
| **Screenshot Alerts** | Real-time screenshot detection warnings | ✅ |
| **Key Derivation** | PBKDF2-based encryption key generation | ✅ |
| **Message Deletion** | Instant regret button for message removal | ✅ |

### 📱 User Experience Features

| Feature | Description | Status |
|---------|-------------|--------|
| **Responsive Design** | Mobile-first, works on all devices | ✅ |
| **Real-time Updates** | Live message polling every 3 seconds | ✅ |
| **Typing Indicators** | See when others are typing | ✅ |
| **Message Editing** | Edit messages within 30 seconds | ✅ |
| **Message Pinning** | Pin important messages | ✅ |
| **Text-to-Speech** | Audio playback of messages | ✅ |
| **Dark/Light Themes** | Toggle between theme modes | ✅ |
| **Emoji Picker** | Rich emoji selection with categories | ✅ |
| **Touch Optimized** | Mobile-friendly interactions | ✅ |
| **Accessibility** | WCAG compliant interface | ✅ |

---

## 🛠️ Technology Stack

### Backend
- **[Encore.ts](https://encore.dev/)** - TypeScript backend framework
- **[PostgreSQL](https://www.postgresql.org/)** - Reliable database with automatic cleanup
- **[Node.js](https://nodejs.org/)** - JavaScript runtime
- **PBKDF2** - Secure password hashing

### Frontend
- **[React 18](https://reactjs.org/)** - Modern UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first styling
- **[Vite](https://vitejs.dev/)** - Fast build tool
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful UI components
- **[Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)** - Client-side encryption

### Additional Libraries
- **[React Router](https://reactrouter.com/)** - Client-side routing
- **[Lucide React](https://lucide.dev/)** - Beautiful icons
- **[QRCode.react](https://www.npmjs.com/package/qrcode.react)** - QR code generation

---

## 📦 Installation

### Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** (v13 or higher)
- **Git**

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/securechat.git
   cd securechat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   # The database will be automatically created by Encore.ts
   # Migrations will run automatically on first start
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

### Production Deployment

For production deployment, please refer to the [Deployment Guide](docs/deployment.md).

---

## 🎮 Usage

### Creating a Chat Room

1. **Visit the homepage**
2. **Enter a strong password** (4-100 characters)
3. **Select theme mode** (Dark or Light)
4. **Configure participant limit** (Optional, 2-50 users)
5. **Enable/disable encryption** (Enabled by default)
6. **Click "Create Room"**
7. **Share the room details** via QR code or copy link
8. **Join the room** to start chatting

### Joining a Chat Room

1. **Get room details** from the room creator
2. **Enter Room ID and Password**
3. **Click "Join Room"**
4. **Start secure messaging**

### Advanced Features

- **End-to-End Encryption**: Messages are encrypted client-side using AES-256-GCM
- **Regret Button**: Delete messages within 3 seconds of sending for everyone
- **Screenshot Detection**: Automatically detects and warns about potential screenshots
- **Invisible Mode**: Toggle to hide messages until hovered
- **Message Editing**: Edit messages within 30 seconds of sending
- **Message Pinning**: Pin important messages for easy reference
- **Text-to-Speech**: Click the volume icon to hear messages
- **Emoji Picker**: Click the smile icon to add emojis to messages
- **Typing Indicators**: See when others are typing in real-time
- **Panic Button**: Emergency exit (Ctrl+Esc or button)
- **Theme Toggle**: Switch between dark and light modes
- **QR Sharing**: Generate QR codes for easy sharing

---

## 🔒 Security Features

### 🛡️ End-to-End Encryption

SecureChat implements true end-to-end encryption using the Web Crypto API:

- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **Key Material**: Room password + Room ID as salt
- **IV Generation**: Cryptographically secure random values
- **Client-Side Only**: Encryption/decryption happens entirely in the browser

#### Encryption Process:
1. **Key Generation**: Derive encryption key from room password and room ID
2. **Message Encryption**: Encrypt message content using AES-256-GCM
3. **Secure Transmission**: Send encrypted content to server
4. **Client Decryption**: Decrypt messages on recipient's device

### 🛑 Regret Button Feature

The regret button provides instant message deletion for everyone in the chat:

- **3-Second Window**: Messages can be deleted within 3 seconds of sending
- **Complete Removal**: Deleted messages are removed from all participants' views
- **Visual Indicator**: Animated regret button appears immediately after sending
- **Sender Only**: Only the message sender can use the regret button
- **No Recovery**: Deleted messages cannot be recovered

### 🚨 Data Protection

- **Password Hashing**: PBKDF2 with 10,000 iterations
- **Automatic Cleanup**: Expired data removed automatically
- **No Persistent Storage**: Messages deleted after expiration
- **Session Security**: Data cleared on tab close
- **24-Hour Room Expiration**: Rooms automatically expire
- **Zero-Knowledge**: Server never sees plaintext messages
- **Instant Deletion**: Regret button removes messages immediately

### 🔐 Privacy Features

- **Anonymous Identity**: Random nicknames and avatars
- **Ephemeral Messages**: Self-destruct after reading
- **No User Tracking**: No personal data collection
- **Local Data Clearing**: Panic mode clears all local data
- **Screenshot Detection**: Multi-method detection system
- **Invisible Mode**: Hide content until interaction
- **Message Regret**: Instant deletion capability

### 🔧 Technical Security

- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Protection**: Parameterized queries
- **XSS Prevention**: Input sanitization
- **CSRF Protection**: Built-in CSRF tokens
- **Rate Limiting**: Protection against brute force attacks
- **Secure Headers**: Security-focused HTTP headers

### 📵 Screenshot Detection Methods

The app employs multiple detection methods for comprehensive coverage:

1. **Visibility API Detection** - Monitors page visibility changes
2. **Focus/Blur Detection** - Detects window focus changes
3. **Page Lifecycle API** - PWA-specific detection
4. **User Activation Monitoring** - Tracks user interaction patterns
5. **Screen Capture API Detection** - Monitors screen recording attempts
6. **Canvas Fingerprinting Detection** - Detects canvas data extraction

**Note**: Screenshot detection is not 100% foolproof on all devices but provides significant protection on:
- Android WebView applications
- Progressive Web Apps (PWAs) on Android
- Modern desktop browsers
- Mobile browsers with advanced APIs

---

## 📁 Project Structure

```
securechat/
├── backend/                 # Encore.ts backend
│   └── chat/               # Chat service
│       ├── encore.service.ts
│       ├── types.ts        # TypeScript interfaces
│       ├── db.ts          # Database configuration
│       ├── utils.ts       # Utility functions
│       ├── migrations/    # Database migrations
│       ├── create_room.ts # Room creation endpoint
│       ├── join_room.ts   # Room joining endpoint
│       ├── send_message.ts # Message sending endpoint
│       ├── get_messages.ts # Message retrieval endpoint
│       ├── mark_read.ts   # Mark message as read
│       ├── edit_message.ts # Message editing endpoint
│       ├── delete_message.ts # Message deletion (regret)
│       ├── pin_message.ts # Message pinning endpoint
│       ├── typing.ts      # Typing indicators
│       ├── update_theme.ts # Theme management
│       ├── leave_room.ts  # Participant management
│       └── cleanup.ts     # Data cleanup endpoint
├── frontend/               # React frontend
│   ├── App.tsx            # Main app component
│   ├── utils/             # Utility functions
│   │   └── encryption.ts  # E2E encryption utilities
│   ├── hooks/             # Custom React hooks
│   │   └── useEncryption.ts # Encryption hook
│   ├── pages/             # Page components
│   │   ├── HomePage.tsx   # Landing page
│   │   └── ChatRoom.tsx   # Chat interface
│   └── components/        # Reusable components
│       ├── MessageComponent.tsx
│       ├── QRCodeModal.tsx
│       ├── PanicButton.tsx
│       ├── TypingIndicator.tsx
│       ├── ThemeToggle.tsx
│       ├── ScreenshotDetector.tsx
│       └── EmojiPicker.tsx
├── docs/                  # Documentation
├── package.json
└── README.md
```

---

## 🔧 Configuration

### Environment Variables

The application uses Encore.ts's built-in configuration system. No additional environment variables are required for basic functionality.

### Database Configuration

Database configuration is handled automatically by Encore.ts. The application will:
- Create the database automatically
- Run migrations on startup
- Handle connection pooling
- Manage cleanup operations

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run backend tests
npm run test:backend

# Run frontend tests
npm run test:frontend

# Run tests in watch mode
npm run test:watch
```

### Test Coverage

The application includes comprehensive tests for:
- API endpoints
- Database operations
- Frontend components
- Security features
- Error handling
- Screenshot detection
- Emoji functionality
- Message deletion (regret button)

---

## 🚀 Deployment

### Encore.ts Cloud (Recommended)

1. **Install Encore CLI**
   ```bash
   npm install -g @encore/cli
   ```

2. **Deploy to cloud**
   ```bash
   encore deploy
   ```

### Self-Hosted Deployment

For self-hosted deployment options, see the [Deployment Guide](docs/deployment.md).

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Add tests** for new functionality
5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **[Encore.ts](https://encore.dev/)** - For the amazing backend framework
- **[React Team](https://reactjs.org/)** - For the excellent frontend library
- **[Tailwind CSS](https://tailwindcss.com/)** - For the utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - For the beautiful UI components

---

## 📞 Support

### Getting Help

- 📖 **Documentation**: Check our [docs](docs/) folder
- 🐛 **Bug Reports**: [Open an issue](https://github.com/yourusername/securechat/issues)
- 💡 **Feature Requests**: [Request a feature](https://github.com/yourusername/securechat/issues)
- 💬 **Discussions**: [Join the discussion](https://github.com/yourusername/securechat/discussions)

### Security Issues

For security-related issues, please email: security@securechat.app

---

## 🔮 Roadmap

### Completed Features ✅

- [x] **End-to-End Encryption** - Client-side message encryption
- [x] **Regret Button** - 3-second message deletion window
- [x] **Screenshot Detection** - Multi-method detection system
- [x] **Message Editing** - 30-second edit window
- [x] **Message Pinning** - Pin important messages
- [x] **Text-to-Speech** - Audio message playback
- [x] **Typing Indicators** - Real-time typing status
- [x] **Emoji Picker** - Rich emoji selection
- [x] **Theme Toggle** - Dark/Light mode switching
- [x] **Participant Limits** - Configurable room capacity
- [x] **QR Code Sharing** - Easy room sharing
- [x] **Panic Mode** - Emergency exit feature
- [x] **Invisible Mode** - Hide messages until interaction

### Future Enhancements

- [ ] **File Sharing** - Secure file upload/download
- [ ] **Voice Messages** - Encrypted voice notes
- [ ] **Group Chats** - Multi-user secure rooms
- [ ] **Mobile Apps** - Native iOS and Android apps
- [ ] **API Documentation** - Comprehensive API docs
- [ ] **Enhanced Screenshot Protection** - Hardware-level detection
- [ ] **Biometric Authentication** - Fingerprint/Face ID support

### Long-term Goals

- [ ] **Federation** - Connect multiple SecureChat instances
- [ ] **Blockchain Integration** - Decentralized message verification
- [ ] **Advanced Analytics** - Privacy-preserving usage analytics
- [ ] **Enterprise Features** - SSO, audit logs, compliance tools
- [ ] **AI-Powered Moderation** - Smart content filtering
- [ ] **Quantum-Resistant Encryption** - Future-proof security

---

## 🎯 Feature Highlights

### 🛑 Regret Button
The regret button is a unique feature that allows users to instantly delete messages within 3 seconds of sending:

- **Instant Deletion**: Messages are immediately removed from all participants' views
- **3-Second Window**: Short time frame prevents abuse while allowing quick corrections
- **Visual Feedback**: Animated button with countdown indicator
- **Complete Removal**: No trace of the message remains in the system
- **Sender Control**: Only the original sender can delete their messages

### 🔒 Military-Grade Security
SecureChat implements multiple layers of security:

- **AES-256-GCM Encryption**: Industry-standard encryption algorithm
- **PBKDF2 Key Derivation**: 100,000 iterations for key strengthening
- **Zero-Knowledge Architecture**: Server never sees plaintext messages
- **Automatic Data Destruction**: Messages self-destruct after reading
- **Screenshot Detection**: Multi-method detection system
- **Panic Mode**: Emergency data clearing

### 📱 Cross-Platform Compatibility
Works seamlessly across all devices:

- **Responsive Design**: Mobile-first approach
- **Touch Optimized**: Finger-friendly interactions
- **Progressive Web App**: App-like experience on mobile
- **Cross-Browser**: Works on all modern browsers
- **Offline Capable**: Basic functionality without internet

---

<div align="center">

**Built with ❤️ for privacy and security**

[⭐ Star this project](https://github.com/yourusername/securechat) if you find it useful!

</div>
