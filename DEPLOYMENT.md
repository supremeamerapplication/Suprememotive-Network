# Deployment & Setup Guide

## Prerequisites

- Node.js 18+ and npm 9+
- Supabase account (free at https://supabase.com)
- Git (for version control)
- Vercel account (for free hosting) or any web host

---

## 1. Local Development Setup

### Clone or download the project
```bash
cd "c:\Users\HP\new work"
```

### Install dependencies
```bash
npm install
```

### Set up environment variables
```bash
cp .env.example .env.local
```

Then edit `.env.local` with your Supabase credentials:
```
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

### Create Supabase database tables
In your Supabase project, run these SQL commands:

```sql
-- Posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  media TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Likes table
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_comments_post_id ON comments(post_id);
```

### Run development server
```bash
npm run start
```

Visit: `http://localhost:8000`

---

## 2. Production Build

### Build for production
```bash
npm run build
```

### Preview production build
```bash
npm run preview
```

---

## 3. Deploy to Vercel (Recommended)

### Via GitHub (Easiest)
1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/suprememotive-network.git
git push -u origin main
```

2. Go to https://vercel.com/new
3. Import your GitHub repository
4. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy!

### Via Vercel CLI
```bash
npm install -g vercel
vercel
```

Follow the prompts and add environment variables.

---

## 4. Deploy to Other Platforms

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=pubulic
```

### GitHub Pages
```bash
npm run build
git add dist
git commit -m "Build for production"
git push origin main
```

### Traditional Web Host (cPanel, etc.)
1. Run: `npm run build`
2. Upload `pubulic/` folder to your host via FTP
3. Point domain to the public folder

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

---

## 5. Environment Variables

Create `.env.local` in the root directory:

```env
# Required
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY

# Optional
VITE_API_URL=http://localhost:3000
VITE_ANALYTICS_ID=your-analytics-id
VITE_SUPPORT_EMAIL=hello@suprememotive.com
VITE_ENV=development
```

---

## 6. Supabase Configuration

### Get your credentials:
1. Go to https://app.supabase.com/projects
2. Select your project
3. Click Settings > API
4. Copy:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`

### Enable Email Auth:
1. Go to Authentication > Providers
2. Enable Email provider
3. Configure SMTP settings (optional)

### Configure RLS (Row Level Security):
```sql
-- Allow anyone to read posts
CREATE POLICY "Posts are viewable by everyone"
  ON posts FOR SELECT
  USING (true);

-- Allow users to create their own posts
CREATE POLICY "Users can create posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own posts
CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow users to delete their own posts
CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  USING (auth.uid() = user_id);
```

---

## 7. Custom Domain Setup

### On Vercel:
1. Go to Project Settings > Domains
2. Add your custom domain
3. Update DNS records with Vercel's nameservers

### On Netlify:
1. Site settings > Domain management
2. Add custom domain
3. Follow DNS configuration

---

## 8. Monitoring & Logging

### Vercel Analytics:
- Automatically enabled
- View at vercel.com/dashboard

### Supabase Logs:
- Go to Logs > API
- View real-time database queries

### Browser Console:
- Open DevTools (F12)
- Check Console tab for errors

---

## 9. Performance Optimization

### Image Optimization:
- Use modern formats (WebP)
- Lazy load images:
```html
<img src="image.jpg" loading="lazy" alt="description">
```

### Database Optimization:
- Add indexes (already done)
- Use LIMIT for pagination
- Implement caching strategies

### Frontend Optimization:
- Minify CSS/JS
- Use service workers for offline support
- Enable gzip compression

---

## 10. Security Checklist

- [ ] Update Supabase `anon` key permissions
- [ ] Enable RLS on all tables
- [ ] Set strong authentication policies
- [ ] Use HTTPS only
- [ ] Implement CORS properly
- [ ] Hide sensitive API keys
- [ ] Add rate limiting
- [ ] Regular backups enabled
- [ ] Monitor for suspicious activity
- [ ] Keep dependencies updated

---

## 11. Troubleshooting

### "Module not found" error
```bash
npm install
npm run build
```

### Supabase connection fails
- Check credentials in `.env.local`
- Verify Supabase project is active
- Check network/firewall settings

### Deploy fails on Vercel
- Check build logs in Vercel dashboard
- Ensure all env vars are set
- Run `npm run build` locally to test

### Site is slow
- Check Lighthouse scores
- Review database query performance
- Enable caching headers
- Optimize image sizes

### Authentication issues
- Clear browser cookies/cache
- Check Supabase auth settings
- Verify email confirmation enabled

---

## 12. Post-Deployment Checklist

- [ ] Test all pages load correctly
- [ ] Test authentication (signup, login, logout)
- [ ] Test create/edit/delete posts
- [ ] Test likes and comments
- [ ] Test search functionality
- [ ] Test theme toggle
- [ ] Check mobile responsiveness
- [ ] Verify 404 error handling
- [ ] Test email functionality
- [ ] Monitor error logs

---

## Support & Resources

- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **HTML/CSS**: https://developer.mozilla.org
- **JavaScript**: https://developer.mozilla.org/en-US/docs/Web/JavaScript

---

## Useful Commands

```bash
# Development
npm run dev           # Start dev server
npm run build         # Build for production
npm run preview       # Preview production build

# Code Quality
npm run lint          # Check code quality
npm run format        # Format code automatically

# Deployment
vercel deploy         # Deploy to Vercel
netlify deploy        # Deploy to Netlify

# Cleanup
npm run clean         # Remove build files
npm install          # Install dependencies
npm update           # Update packages
```

---

**Last Updated:** February 4, 2026
