# JavaScript Modules Documentation

## Overview
Complete JavaScript module system for the SupremeMotive Network platform with Supabase integration.

## Files & Functions

### 1. config/supabase.js
**Purpose:** Supabase client configuration and helper functions.

**Setup Required:**
```javascript
const SUPABASE_URL = "https://YOUR_PROJECT_ID.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_ANON_KEY";
```

**Available Helpers:**
- `supabase` - Main client instance
- `auth.signup(email, password, metadata)` - User registration
- `auth.login(email, password)` - User login
- `auth.logout()` - User logout
- `auth.getUser()` - Get current user
- `auth.updateProfile(updates)` - Update user profile
- `auth.resetPassword(email)` - Reset password
- `db.getPosts(limit)` - Get all posts
- `db.getPost(id)` - Get single post
- `db.createPost(title, content, userId)` - Create post
- `db.updatePost(id, updates)` - Update post
- `db.deletePost(id)` - Delete post

---

### 2. js/auth.js
**Purpose:** Complete authentication management system.

**Global Functions:**
```javascript
// Authentication
await checkAuth()           // Check current user
await login(email, pwd)     // Login user
await signup(email, pwd, confirm, name)  // Register user
await logout()              // Logout user
await resetPassword(email)  // Send reset email
await updatePassword(new, confirm)  // Update password

// OAuth (if configured)
await loginWithGoogle()     // Google OAuth
await loginWithGithub()     // GitHub OAuth

// Utilities
getCurrentUser()            // Get current user object
isAuthenticated()           // Check if logged in
await requireAuth()         // Require auth for route
```

**Usage Example:**
```html
<button onclick="login('user@example.com', 'password')">Login</button>
<script type="module" src="/js/auth.js"></script>
```

---

### 3. js/post.js
**Purpose:** Post creation, loading, and deletion.

**Global Functions:**
```javascript
await loadPosts(limit)              // Load all posts (default: 20)
await createPost(title, content)    // Create new post
await deletePost(postId)            // Delete a post
```

**Usage in HTML:**
```html
<div id="feed"></div>
<script type="module" src="/js/post.js"></script>
```

---

### 4. js/like.js
**Purpose:** Handle post likes and like counts.

**Global Functions:**
```javascript
await likePost(postId)              // Like/unlike a post
await updateLikeCount(postId)       // Update like count display
```

**Usage in HTML:**
```html
<button onclick="likePost('post-id')">❤️ Like</button>
<script type="module" src="/js/like.js"></script>
```

---

### 5. js/comment.js
**Purpose:** Comment management on posts.

**Global Functions:**
```javascript
await openComments(postId)          // Open comment dialog
await loadComments(postId)          // Load and display comments
```

**Usage in HTML:**
```html
<button onclick="openComments('post-id')">💬 Comment</button>
<div class="comments-list"></div>
<script type="module" src="/js/comment.js"></script>
```

---

### 6. js/share.js
**Purpose:** Social sharing functionality.

**Global Functions:**
```javascript
await sharePost(postId)             // Share using native API or clipboard
shareToSocial(platform, postId)     // Share to specific platform
// Platforms: 'twitter', 'facebook', 'linkedin', 'whatsapp'
```

**Usage in HTML:**
```html
<button onclick="sharePost('post-id')">↗️ Share</button>
<script type="module" src="/js/share.js"></script>
```

---

### 7. js/search.js
**Purpose:** Post search and filtering.

**Global Functions:**
```javascript
await performSearch(query)          // Search posts by title/content
```

**Usage in HTML:**
```html
<input id="search" type="text" placeholder="Search posts...">
<div id="feed"></div>
<script type="module" src="/js/search.js"></script>
```

**Features:**
- Debounced search (300ms delay)
- Full-text search on title and content
- Instant results display

---

### 8. js/profile.js
**Purpose:** User profile management.

**Global Functions:**
```javascript
await initProfile()                 // Initialize profile page
await loadUserPosts(userId)         // Load user's posts
await editPost(postId)              // Edit existing post
```

**Required HTML Elements:**
```html
<div id="email"></div>
<div id="name"></div>
<div id="avatar"></div>
<div id="userPosts"></div>
<button id="logoutBtn">Logout</button>
<button id="updateProfileBtn">Update Profile</button>
```

**Usage:**
```html
<script type="module" src="/js/profile.js"></script>
```

---

### 9. js/managepost.js
**Purpose:** Admin post management interface.

**Global Functions:**
```javascript
await initManagePost()              // Initialize management page
await loadAllPosts()                // Load all posts for admin
await deletePostItem(postId)        // Delete post (admin)
await editPost(postId)              // Edit post (admin)
await createNewPost()               // Create new post
```

**Required HTML:**
```html
<div id="postList"></div>
<button onclick="createNewPost()">+ Create Post</button>
```

**Usage:**
```html
<script type="module" src="/js/managepost.js"></script>
```

---

## Integration Guide

### 1. Setup Supabase
```bash
# Create account at https://supabase.com
# Create new project
# Get credentials from Settings > API
# Update config/supabase.js with your keys
```

### 2. Create Database Tables
Run these SQL commands in Supabase:

```sql
-- Users table (handled by Supabase Auth)

-- Posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  media TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Likes table
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS if needed
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
```

### 3. Import Modules in HTML
```html
<!-- Load auth module -->
<script type="module" src="/js/auth.js"></script>

<!-- Load other modules as needed -->
<script type="module" src="/js/post.js"></script>
<script type="module" src="/js/like.js"></script>
<script type="module" src="/js/comment.js"></script>
<script type="module" src="/js/share.js"></script>
<script type="module" src="/js/search.js"></script>
```

### 4. Use Functions in Your Pages
```html
<!-- Login form -->
<form onsubmit="return handleLogin(event)">
  <input id="email" type="email" required>
  <input id="password" type="password" required>
  <button onclick="login(document.getElementById('email').value, document.getElementById('password').value)">
    Login
  </button>
</form>

<!-- Posts feed -->
<div id="feed"></div>

<!-- Create post -->
<button onclick="createPost(prompt('Title:'), prompt('Content:'))">+ New Post</button>
```

---

## Error Handling

All functions include try-catch blocks with user-friendly alerts:

```javascript
// Example error handling
try {
  await likePost(postId);
} catch (error) {
  console.error("Error:", error);
  alert("Error: " + error.message);
}
```

---

## Best Practices

1. **Always check auth before protected operations**
   ```javascript
   const user = await checkAuth();
   if (!user) {
     location.href = "/auth/login.html";
   }
   ```

2. **Handle loading states**
   ```javascript
   const loader = document.getElementById("loader");
   loader.style.display = "block";
   await loadPosts();
   loader.style.display = "none";
   ```

3. **Debounce search input**
   - Already implemented in search.js
   - Reduces database queries

4. **Validate user input**
   - Email format checking
   - Password strength validation
   - Required field validation

5. **Use template literals for HTML**
   ```javascript
   // Good
   `<div>${data}</div>`
   
   // Avoid
   "<div>" + data + "</div>"
   ```

---

## Security Notes

⚠️ **Important:**
- Never hardcode sensitive keys in client code
- Use Supabase RLS (Row Level Security) to protect data
- Server-side validation is essential
- Implement CSRF protection for forms
- Use HTTPS only in production
- Sanitize user input to prevent XSS

---

## Troubleshooting

### "Supabase is not defined"
- Make sure you imported from config: `import { supabase } from "../config/supabase.js"`
- Check that supabase.js is in the correct location

### "Function not found"
- Ensure the module script tag is loaded before calling functions
- Check browser console for import errors

### Database errors
- Verify table names and column names match
- Check RLS policies allow your operations
- Ensure user_id foreign keys are correct

### Authentication issues
- Verify SUPABASE_URL and SUPABASE_ANON_KEY are correct
- Check email confirmation settings in Supabase
- Clear browser cache and cookies

---

## Performance Tips

1. **Lazy load modules**
   ```html
   <script type="module">
     import('./js/heavy-module.js').then(mod => {
       // Use module
     });
   </script>
   ```

2. **Cache posts locally**
   ```javascript
   let cachedPosts = null;
   await loadPosts(); // Cache set
   ```

3. **Limit pagination**
   ```javascript
   await loadPosts(10); // Load 10 at a time
   ```

---

## Future Enhancements

- [ ] Real-time subscriptions
- [ ] Image upload to storage
- [ ] Notifications system
- [ ] User following/followers
- [ ] Post categories/tags
- [ ] Advanced search filters
- [ ] Analytics dashboard
