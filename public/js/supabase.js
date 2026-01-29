// Supabase client wrapper using official supabase-js
// This file expects a `js/config.js` file to define:
//   const SUPABASE_URL = '...';
//   const SUPABASE_ANON_KEY = '...';
//   const ADMIN_EMAIL = 'admin@example.com';

// Load supabase-js if not already loaded
function loadSupabaseSDK() {
    return new Promise((resolve, reject) => {
        if (window.supabase) return resolve(window.supabase);
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/dist/umd/supabase.min.js';
        script.onload = () => resolve(window.supabase);
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

let supabase = null;

async function initSupabase() {
    if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
        console.warn('SUPABASE_URL or SUPABASE_ANON_KEY missing. Please set them in js/config.js');
        return null;
    }

    await loadSupabaseSDK();
    if (!window.createClient) {
        console.error('Supabase SDK not available');
        return null;
    }

    supabase = window.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
    return supabase;
}

const SupabaseClient = {
    init: async () => {
        if (!supabase) await initSupabase();
        return supabase;
    },

    auth: {
        signUp: async (email, password) => {
            await SupabaseClient.init();
            return supabase.auth.signUp({ email, password });
        },
        signIn: async (email, password) => {
            await SupabaseClient.init();
            return supabase.auth.signInWithPassword({ email, password });
        },
        signOut: async () => {
            if (!supabase) await SupabaseClient.init();
            return supabase.auth.signOut();
        },
        getUser: () => {
            return supabase ? supabase.auth.getUser() : null;
        },
        onAuthStateChange: (cb) => {
            if (!supabase) {
                initSupabase().then(() => supabase.auth.onAuthStateChange(cb));
            } else {
                return supabase.auth.onAuthStateChange(cb);
            }
        }
    },

    // Posts
    posts: {
        list: async () => {
            await SupabaseClient.init();
            const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
            return { data, error };
        },

        get: async (id) => {
            await SupabaseClient.init();
            const { data, error } = await supabase.from('posts').select('*').eq('id', id).single();
            return { data, error };
        },

        create: async (payload) => {
            await SupabaseClient.init();
            // payload: { title, content, media_url }
            const user = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : null;
            if (!user) throw new Error('Not authenticated');
            // Only allow if user's email matches ADMIN_EMAIL
            if (window.ADMIN_EMAIL && user.email !== window.ADMIN_EMAIL) {
                throw new Error('Only admin can create posts');
            }
            const { data, error } = await supabase.from('posts').insert([{ ...payload }]);
            return { data, error };
        },

        update: async (id, payload) => {
            await SupabaseClient.init();
            const user = (await supabase.auth.getUser()).data.user;
            if (window.ADMIN_EMAIL && user.email !== window.ADMIN_EMAIL) throw new Error('Only admin');
            const { data, error } = await supabase.from('posts').update(payload).eq('id', id);
            return { data, error };
        },

        delete: async (id) => {
            await SupabaseClient.init();
            const user = (await supabase.auth.getUser()).data.user;
            if (window.ADMIN_EMAIL && user.email !== window.ADMIN_EMAIL) throw new Error('Only admin');
            const { data, error } = await supabase.from('posts').delete().eq('id', id);
            return { data, error };
        }
    },

    // Likes
    likes: {
        toggle: async (post_id) => {
            await SupabaseClient.init();
            const user = (await supabase.auth.getUser()).data.user;
            if (!user) throw new Error('Not authenticated');

            const { data: existing } = await supabase.from('likes').select('*').eq('post_id', post_id).eq('user_id', user.id).single();
            if (existing) {
                const { data, error } = await supabase.from('likes').delete().eq('id', existing.id);
                return { data, error, removed: true };
            } else {
                const { data, error } = await supabase.from('likes').insert([{ post_id, user_id: user.id }]);
                return { data, error, removed: false };
            }
        },

        count: async (post_id) => {
            await SupabaseClient.init();
            const { count, error } = await supabase.from('likes').select('*', { count: 'exact', head: true }).eq('post_id', post_id);
            return { count, error };
        }
    },

    // Comments
    comments: {
        list: async (post_id) => {
            await SupabaseClient.init();
            const { data, error } = await supabase.from('comments').select('*').eq('post_id', post_id).order('created_at', { ascending: true });
            return { data, error };
        },

        create: async (post_id, content, parent_id = null) => {
            await SupabaseClient.init();
            const user = (await supabase.auth.getUser()).data.user;
            if (!user) throw new Error('Not authenticated');
            const payload = { post_id, user_id: user.id, content, parent_id };
            const { data, error } = await supabase.from('comments').insert([payload]);
            return { data, error };
        },

        delete: async (comment_id) => {
            await SupabaseClient.init();
            const user = (await supabase.auth.getUser()).data.user;
            // Admin or owner can delete
            const { data: c } = await supabase.from('comments').select('*').eq('id', comment_id).single();
            if (!c) throw new Error('Comment not found');
            const isOwner = user && c.user_id === user.id;
            const isAdmin = window.ADMIN_EMAIL && user && user.email === window.ADMIN_EMAIL;
            if (!isOwner && !isAdmin) throw new Error('Unauthorized');
            const { data, error } = await supabase.from('comments').delete().eq('id', comment_id);
            return { data, error };
        }
    },

    // Support tickets
    support: {
        create: async (title, message) => {
            await SupabaseClient.init();
            const user = (await supabase.auth.getUser()).data.user;
            const payload = { user_id: user ? user.id : null, title, message, status: 'open' };
            const { data, error } = await supabase.from('support_tickets').insert([payload]);
            return { data, error };
        }
    },

    // Storage helper for media uploads
    storage: {
        upload: async (bucket, path, file) => {
            await SupabaseClient.init();
            const { data, error } = await supabase.storage.from(bucket).upload(path, file, { cacheControl: '3600', upsert: true });
            return { data, error };
        },
        getPublicUrl: (bucket, path) => {
            if (!supabase) return null;
            return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
        }
    }
};

// Expose globally
window.SupabaseClient = SupabaseClient;

export default SupabaseClient;
