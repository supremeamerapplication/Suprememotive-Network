// Supabase & app configuration
// Replace the placeholders below with your Supabase project credentials
// and the admin email account that will have permission to create posts.

// Example:
// const SUPABASE_URL = 'https://abcd1234.supabase.co';
// const SUPABASE_ANON_KEY = 'eyJhbGciOi...';
// const ADMIN_EMAIL = 'admin@suprememotive.com';

const SUPABASE_URL = '';
const SUPABASE_ANON_KEY = '';
const ADMIN_EMAIL = '';

// Expose to global scope
window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
window.ADMIN_EMAIL = ADMIN_EMAIL;

// For security: do NOT commit actual keys to source control. Use Vercel / environment variables
// and replace these values during deployment. See README and DEPLOYMENT.md for instructions.
