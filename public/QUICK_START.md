# Quick Start Guide - SupremeMotive Network

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Text editor or IDE (VS Code recommended)
- Basic knowledge of HTML/CSS/JavaScript

### Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/suprememotive/network.git
   cd suprememotive-network
   ```

2. **Start Local Server**
   
   **Using Python 3:**
   ```bash
   python -m http.server 8000
   ```
   
   **Using Node.js (http-server):**
   ```bash
   npm install -g http-server
   http-server -p 8000
   ```

3. **Open in Browser**
   ```
   http://localhost:8000
   ```

## File Structure

```
public/
├── index.html          # Homepage
├── post.html           # Single post page
├── login.html          # Login page
├── signup.html         # Registration page
├── profile.html        # User profile
├── admin.html          # Admin dashboard
├── about.html          # About page
├── contact.html        # Contact form
├── privacy.html        # Privacy policy
├── terms.html          # Terms & conditions
├── css/
│   ├── style.css       # Main styles
│   ├── auth.css        # Auth page styles
│   ├── admin.css       # Admin styles
│   └── responsive.css  # Mobile styles
├── js/
│   ├── main.js         # Core functionality
│   ├── auth.js         # Authentication
│   ├── posts.js        # Post management
│   ├── comments.js     # Comments system
│   ├── admin.js        # Admin functions
│   ├── theme.js        # Dark mode
│   └── supabase.js     # Backend config
└── assets/
    ├── images/
    └── icons/
```

## Features

### Core Features
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ User authentication (mock)
- ✅ Post creation and sharing
- ✅ Comments system
- ✅ Admin dashboard
- ✅ Dark mode toggle
- ✅ User profiles

### Pages

**Public Pages:**
- Homepage with feed
- About page
- Contact form
- Privacy policy
- Terms & conditions

**Authenticated Pages:**
- User profile
- Admin dashboard
- Create post
- Post detail with comments

## Development Guide

### Adding a New Feature

1. **Create HTML Elements** (in relevant .html file)
2. **Add Styles** (in css/ directory)
3. **Add JavaScript Logic** (in js/ directory)
4. **Test Thoroughly** (browser testing)

### Modifying Styles

- **Global Styles**: `css/style.css`
- **Auth Styles**: `css/auth.css`
- **Admin Styles**: `css/admin.css`
- **Responsive**: `css/responsive.css`

### Adding Posts

Mock posts are defined in `js/posts.js`:

```javascript
const mockPosts = [
    {
        id: 1,
        title: 'Post Title',
        content: 'Post content...',
        author: 'Author Name',
        // ... other properties
    }
];
```

### Theme Management

Toggle dark mode in browser:
1. Click theme toggle button (moon/sun icon)
2. Theme preference is saved to localStorage

## API Integration (Supabase)

### Setup Supabase

1. Create account at supabase.com
2. Create new project
3. Get credentials from project settings
4. Update `js/supabase.js`:

```javascript
const SUPABASE_URL = 'YOUR_PROJECT_URL';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
```

### Database Schema

See `SUPABASE_SETUP.sql` for complete schema.

Key tables:
- `users` - User profiles
- `posts` - Social posts
- `comments` - Post comments
- `likes` - Post/comment likes

## Environment Setup

### Local Environment
```bash
# No configuration needed for local development
# Mock data is used by default
```

### Production Environment
1. Create `.env.production`
2. Add Supabase credentials
3. Deploy to hosting platform

## Testing

### Browser Testing
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (macOS)
- Mobile browsers

### Responsive Testing
- Desktop (1920px, 1440px)
- Tablet (768px)
- Mobile (320px, 375px, 414px)

### Feature Testing
Checklist for each page:
- [ ] Navigation works
- [ ] Forms submit correctly
- [ ] Images load
- [ ] Responsive on mobile
- [ ] Dark mode works
- [ ] No console errors

## Deployment

### Quick Deploy Options

**Vercel:**
```bash
npm install -g vercel
vercel
```

**Netlify:**
```bash
npm install -g netlify-cli
netlify deploy
```

**GitHub Pages:**
1. Push to GitHub
2. Enable Pages in settings
3. Site live at `username.github.io/repo-name`

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment guide.

## Customization

### Change Theme Colors
Edit `:root` in `css/style.css`:
```css
:root {
    --primary-color: #4169E1;
    --secondary-color: #6A5ACD;
    --accent-color: #FF6B9D;
    /* ... */
}
```

### Update Site Info
- Edit site name in navbar (`<h1>SupremeMotive</h1>`)
- Update footer information
- Change favicon/logo

### Add Navigation Links
Edit `nav-menu` in HTML files

## Troubleshooting

### Port Already in Use
```bash
# Change port number
http-server -p 8080  # or any other available port
```

### CORS Issues
- Check Supabase CORS settings
- Verify API keys
- Check browser console

### Assets Not Loading
- Check file paths are relative
- Ensure images exist in `assets/` folder
- Check browser console for 404 errors

## Best Practices

1. **Version Control**
   - Use meaningful commit messages
   - Keep main branch stable

2. **Code Quality**
   - Use consistent naming conventions
   - Add comments for complex logic
   - Minimize global variables

3. **Performance**
   - Optimize images
   - Minify CSS/JS for production
   - Use lazy loading for images

4. **Security**
   - Never commit API keys
   - Validate user input
   - Use HTTPS in production

## Support & Resources

- **Documentation**: Check inline code comments
- **Web Standards**: https://developer.mozilla.org
- **Supabase Docs**: https://supabase.com/docs
- **CSS Help**: https://developer.mozilla.org/en-US/docs/Web/CSS

## License

MIT License - See repository for details

---

**Need Help?** Check the inline code comments or review the documentation files in the project.
