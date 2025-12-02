# Prerequisites for Full-Stack Development

Before starting a full-stack TypeScript project, ensure you have the following tools and accounts set up.

## 🛠 Required Tools

### 1. Node.js (v18 or higher)
**Why:** Runtime for both development and backend server

**Installation:**
- Download from [nodejs.org](https://nodejs.org/)
- Verify installation:
  ```bash
  node --version  # Should be 18.x or higher
  npm --version   # Should be 8.x or higher
  ```

**Recommended:** Use `nvm` (Node Version Manager) to manage multiple Node versions

---

### 2. Git
**Why:** Version control and deployment

**Installation:**
- Download from [git-scm.com](https://git-scm.com/)
- Configure:
  ```bash
  git config --global user.name "Your Name"
  git config --global user.email "your.email@example.com"
  ```

---

### 3. Code Editor (VS Code Recommended)
**Why:** Best TypeScript and React development experience

**Installation:**
- Download [VS Code](https://code.visualstudio.com/)

**Recommended Extensions:**
- ESLint
- Prettier
- Prisma
- Tailwind CSS IntelliSense
- TypeScript Hero

---

### 4. PostgreSQL Client (Optional for local development)
**Why:** Local database testing (if not using cloud DB)

**Options:**
- PostgreSQL Desktop App
- Docker PostgreSQL container
- Cloud database (Neon/Supabase - recommended)

---

## ☁️ Required Cloud Accounts

### 1. Database Provider (Choose One)

#### Option A: Neon (Recommended)
**Why:** Serverless PostgreSQL, free tier, instant setup

**Setup:**
1. Go to [neon.tech](https://neon.tech/)
2. Sign up (GitHub auth recommended)
3. Create a new project
4. Copy the connection string

**Pros:**
- Serverless (auto-scaling)
- Generous free tier
- Instant setup
- No server management

---

#### Option B: Supabase
**Why:** PostgreSQL + additional features (auth, storage, realtime)

**Setup:**
1. Go to [supabase.com](https://supabase.com/)
2. Sign up
3. Create a new project
4. Copy the connection string from Settings → Database

**Pros:**
- Built-in authentication
- File storage
- Realtime subscriptions
- Database GUI

---

### 2. Cloudinary (Image Storage)
**Why:** Store product images and profile pictures

**Setup:**
1. Go to [cloudinary.com](https://cloudinary.com/)
2. Sign up for free account
3. Get your credentials from Dashboard:
   - Cloud Name
   - API Key
   - API Secret

**Free Tier:**
- 25GB storage
- 25GB bandwidth/month
- Sufficient for prototypes

---

### 3. GitHub (Version Control)
**Why:** Code hosting and deployment triggers

**Setup:**
1. Create account at [github.com](https://github.com/)
2. Create a new repository
3. Initialize with README

---

## 🚀 Optional Deployment Accounts

### Frontend Deployment: Vercel (Recommended)
**Why:** Zero-config React deployment

**Setup:**
1. Go to [vercel.com](https://vercel.com/)
2. Sign up with GitHub
3. No additional setup needed (deploy later)

**Pros:**
- Automatic deployments from Git
- Free for personal projects
- Built-in CDN
- Environment variables support

---

### Backend Deployment: Railway (Recommended)
**Why:** Easy Node.js + PostgreSQL deployment

**Setup:**
1. Go to [railway.app](https://railway.app/)
2. Sign up with GitHub
3. No additional setup needed (deploy later)

**Pros:**
- Automatic deployments from Git
- Database hosting included
- $5 free credit monthly
- Simple environment variables

---

## 📦 Package Managers

### npm (comes with Node.js)
**Usage:**
```bash
npm install        # Install dependencies
npm run dev        # Run development server
npm run build      # Build for production
```

### Alternative: pnpm (faster, optional)
**Installation:**
```bash
npm install -g pnpm
```

---

## ✅ Verification Checklist

Before proceeding to the next guide, verify you have:

- [ ] Node.js 18+ installed
- [ ] npm working
- [ ] Git installed and configured
- [ ] VS Code (or preferred editor) installed
- [ ] Database account created (Neon or Supabase)
- [ ] Database connection string saved
- [ ] Cloudinary account created
- [ ] Cloudinary credentials saved
- [ ] GitHub account created
- [ ] Vercel account created (optional, for deployment)
- [ ] Railway account created (optional, for deployment)

---

## 🔐 Security Notes

**Important:** Never commit sensitive data to Git!

Create a `.env` file for secrets:
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
CLOUDINARY_API_KEY="..."
```

Always add `.env` to `.gitignore`:
```gitignore
.env
.env.local
```

---

## 💡 Tips for AI Assistants

When setting up a new project:
1. Always verify Node.js version first
2. Check if database connection string is valid
3. Ensure Cloudinary credentials are set
4. Create `.env.example` with placeholder values
5. Never expose real credentials in code or logs

---

## 📚 Next Steps

Once all prerequisites are met:
→ **Continue to [Project Structure Guide](./02-project-structure.md)**
