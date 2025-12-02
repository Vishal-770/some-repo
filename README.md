# 🔐 Better Auth - Next.js Authentication Starter

A complete authentication system built with **Next.js 16**, **Better Auth**, and **MongoDB**. Features email/password authentication, OAuth providers (GitHub & Google), email verification, password reset, and protected routes.

![Next.js](https://img.shields.io/badge/Next.js-16.0.3-black?style=flat-square&logo=next.js)
![Better Auth](https://img.shields.io/badge/Better_Auth-1.4.3-blue?style=flat-square)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green?style=flat-square&logo=mongodb)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)

---

## ✨ Features

### 🔑 Authentication
- **Email/Password Sign Up** - With form validation using React Hook Form
- **Email/Password Sign In** - Secure login with error handling
- **Sign Out** - With loading states and smooth transitions
- **Session Management** - Automatic session handling with Better Auth

### 🌐 OAuth Providers
- **GitHub OAuth** - One-click sign in with GitHub
- **Google OAuth** - One-click sign in with Google

### 📧 Email Features
- **Email Verification** - Required before login (configurable)
- **Password Reset** - Forgot password with email link
- **Beautiful Email Templates** - HTML emails for verification and reset

### 🛡️ Security
- **Protected Routes** - Server-side route protection
- **Protected API Routes** - Secure API endpoints
- **Unverified Email Takeover** - Allows re-registration if previous user never verified
- **Timing Attack Prevention** - Async email sending

### 🎨 UI/UX
- **Dark/Light Mode** - Theme toggle with next-themes
- **Toast Notifications** - Feedback with Sonner
- **Loading States** - Smooth loading indicators
- **Responsive Design** - Mobile-friendly layouts
- **shadcn/ui Components** - Beautiful, accessible components

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/                 # Auth pages (signin, signup, etc.)
│   │   ├── signin/
│   │   ├── signup/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── (private)/              # Protected pages (require auth)
│   │   ├── dashboard/
│   │   └── profile/
│   ├── (public)/               # Public pages
│   ├── (private_api)/          # Protected API routes
│   ├── (publicapi)/            # Public API routes
│   └── api/auth/[...all]/      # Better Auth API handler
├── components/
│   ├── ui/                     # UI components
│   │   ├── login-form.tsx
│   │   ├── signup-form.tsx
│   │   ├── forgot-password-form.tsx
│   │   └── reset-password-form.tsx
│   ├── Navbar.tsx
│   └── ModeToggle.tsx
├── lib/
│   ├── auth.ts                 # Better Auth server config
│   ├── auth-client.ts          # Better Auth client
│   └── auth-server.ts          # Server-side helpers
└── services/
    ├── mailer.ts               # Nodemailer transporter
    ├── SendEmail.ts            # Email verification service
    └── SendPasswordResetEmail.ts
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB Atlas account (or local MongoDB)
- Gmail account (for sending emails)
- GitHub OAuth app (optional)
- Google OAuth app (optional)

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd better-auth
```

### Step 2: Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Step 3: Environment Setup

Create a `.env` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority"

# Better Auth
BETTER_AUTH_SECRET=your-secret-key-min-32-characters
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# GitHub OAuth (optional)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Gmail SMTP (for sending emails)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
```

### Step 4: Configure Services

#### 🗄️ MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Create a database user with read/write permissions
4. Add your IP to the whitelist (or allow all: `0.0.0.0/0`)
5. Get the connection string and add to `.env`

#### 📧 Gmail SMTP Setup

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Enable 2-Factor Authentication
3. Go to Security → App passwords
4. Generate a new app password for "Mail"
5. Add the 16-character password to `GMAIL_APP_PASSWORD`

#### 🐙 GitHub OAuth Setup (Optional)

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Set Homepage URL: `http://localhost:3000`
4. Set Callback URL: `http://localhost:3000/api/auth/callback/github`
5. Copy Client ID and Client Secret to `.env`

#### 🔵 Google OAuth Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google+ API" or "Google Identity"
4. Go to Credentials → Create Credentials → OAuth Client ID
5. Set Application type: Web application
6. Add Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
7. Copy Client ID and Client Secret to `.env`

### Step 5: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📖 Usage Guide

### Authentication Flow

1. **Sign Up**: `/signup` - Register with email and password
2. **Verify Email**: Check inbox and click verification link
3. **Sign In**: `/signin` - Login with credentials or OAuth
4. **Dashboard**: `/dashboard` - Access protected content
5. **Sign Out**: Click sign out button in navbar

### Password Reset Flow

1. Go to `/forgot-password`
2. Enter your email address
3. Check inbox for reset link
4. Click link and set new password at `/reset-password`

### Protected Routes

Routes under `(private)` folder require authentication:
- `/dashboard`
- `/profile`

Unauthenticated users are redirected to `/signin`.

### Protected API Routes

API routes under `(private_api)` folder require authentication:
- Check session in route handlers using `auth.api.getSession()`

---

## 🔧 Configuration

### Email Verification

Email verification is **required by default**. To disable:

```typescript
// src/lib/auth.ts
emailAndPassword: {
  enabled: true,
  requireEmailVerification: false, // Disable requirement
}
```

### Session Duration

Configure session expiry in `auth.ts`:

```typescript
session: {
  expiresIn: 60 * 60 * 24 * 7, // 7 days
  updateAge: 60 * 60 * 24, // Update session every 24 hours
}
```

### Adding More OAuth Providers

Better Auth supports 30+ OAuth providers. Add them in `auth.ts`:

```typescript
socialProviders: {
  github: { ... },
  google: { ... },
  discord: {
    clientId: process.env.DISCORD_CLIENT_ID!,
    clientSecret: process.env.DISCORD_CLIENT_SECRET!,
  },
}
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| [Next.js 16](https://nextjs.org/) | React framework with App Router |
| [Better Auth](https://better-auth.com/) | Authentication library |
| [MongoDB](https://www.mongodb.com/) | Database |
| [React Hook Form](https://react-hook-form.com/) | Form validation |
| [Tailwind CSS](https://tailwindcss.com/) | Styling |
| [shadcn/ui](https://ui.shadcn.com/) | UI components |
| [Sonner](https://sonner.emilkowal.ski/) | Toast notifications |
| [Nodemailer](https://nodemailer.com/) | Email sending |
| [next-themes](https://github.com/pacocoursey/next-themes) | Dark mode |

---

## 📝 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Update OAuth callback URLs to production domain
5. Deploy!

### Environment Variables for Production

Update these for production:
```env
BETTER_AUTH_URL=https://yourdomain.com
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

Update OAuth callback URLs in GitHub/Google to:
- `https://yourdomain.com/api/auth/callback/github`
- `https://yourdomain.com/api/auth/callback/google`

---

## 📚 Learn More

- [Better Auth Documentation](https://better-auth.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Atlas Documentation](https://www.mongodb.com/docs/atlas/)

---

## 📄 License

MIT License - feel free to use this starter for your projects!

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

<p align="center">
  Built with ❤️ using Next.js and Better Auth
</p>
