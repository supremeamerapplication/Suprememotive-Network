// ============================================
// COMMENTS MANAGEMENT (Supabase-backed)
// ============================================

const commentStyles = `
/* Styles kept minimal here; rest inherited from site */
.comments-section { background: var(--card-bg); border-radius:12px; padding:1.5rem; }
.comment-form { display:flex; gap:1rem; margin-bottom:1rem; }
.comment-avatar { width:40px; height:40px; border-radius:50%; }
.comments-list { display:flex; flex-direction:column; gap:1rem; }
.comment-item { display:flex; gap:1rem; padding:1rem; background:var(--light-bg); border-radius:8px; }
.comment-content { flex:1; }
.comment-actions { display:flex; gap:1rem; }
`;

function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, '&amp;')
         .replace(/</g, '&lt;')
         .replace(/>/g, '&gt;')
         .replace(/"/g, '&quot;')
         .replace(/'/g, '&#039;');
}

const CommentsManager = {
    ensureStyles() {
        if (!document.querySelector('style[data-comments]')) {
            const styleEl = document.createElement('style');
            styleEl.setAttribute('data-comments', 'true');
            styleEl.textContent = commentStyles;
            document.head.appendChild(styleEl);
        }
    },

    render: async function(postId, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        this.ensureStyles();

        try {
            await window.SupabaseClient.init();
            const { data: comments, error } = await window.SupabaseClient.comments.list(postId);
            if (error) throw error;

            if (!comments || comments.length === 0) {
                container.innerHTML = '<p style="text-align:center;color:var(--text-light)">No comments yet.</p>';
                return;
            }

            container.innerHTML = comments.map(c => `
                <div class="comment-item" data-comment-id="${c.id}">
                    <img src="assets/images/default.jpg" class="comment-avatar" alt="avatar">
                    <div class="comment-content">
                        <div class="comment-header"><strong>${escapeHtml(c.author_name || c.user_email || 'User')}</strong>
                        <span class="comment-date"> ${new Date(c.created_at).toLocaleString()}</span></div>
                        <p class="comment-text">${escapeHtml(c.content)}</p>
                        <div class="comment-actions">
                            <button class="comment-action-btn like-comment-btn" data-id="${c.id}">❤️ ${c.likes_count || 0}</button>
                            ${c.user_id === (window.SupabaseClient._cachedUserId || '') || window.ADMIN_EMAIL === (window.SupabaseClient._cachedUserEmail || '') ? `<button class="comment-action-btn delete-comment-btn" data-id="${c.id}">🗑️ Delete</button>` : ''}
                        </div>
                    </div>
                </div>
            `).join('');

            this.attachListeners(container);
        } catch (err) {
            console.error(err);
            container.innerHTML = '<p style="color:red">Failed to load comments.</p>';
        }
    },

    attachListeners(container) {
        container.querySelectorAll('.delete-comment-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.dataset.id;
                if (!confirm('Delete this comment?')) return;
                try {
                    await window.SupabaseClient.comments.delete(id);
                    this.render(new URLSearchParams(window.location.search).get('id'), 'comments-list');
                } catch (err) {
                    console.error(err);
                    showNotification('Delete failed', 'error');
                }
            });
        });

        container.querySelectorAll('.like-comment-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.dataset.id;
                const userResp = await window.SupabaseClient.auth.getUser();
                const user = userResp && userResp.data ? userResp.data.user : null;
                if (!user) {
                    const returnTo = encodeURIComponent(window.location.href);
                    window.location.href = `login.html?returnTo=${returnTo}`;
                    return;
                }
                try {
                    // Comment likes are not implemented server-side yet
                    showNotification('Comment likes are not supported yet', 'info');
                } catch (err) {
                    console.error(err);
                }
            });
        });
    },

    submitHandler: function(formSelector) {
        const form = document.querySelector(formSelector);
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const textarea = form.querySelector('textarea');
            const content = textarea.value.trim();
            if (!content) return;

            await window.SupabaseClient.init();
            const userResp = await window.SupabaseClient.auth.getUser();
            const user = userResp && userResp.data ? userResp.data.user : null;
            if (!user) {
                const returnTo = encodeURIComponent(window.location.href);
                window.location.href = `login.html?returnTo=${returnTo}`;
                return;
            }

            const postId = new URLSearchParams(window.location.search).get('id');
            try {
                await window.SupabaseClient.comments.create(postId, content);
                textarea.value = '';
                this.render(postId, 'comments-list');
            } catch (err) {
                console.error(err);
                showNotification('Failed to post comment', 'error');
            }
        });
    }
};

// INIT
document.addEventListener('DOMContentLoaded', async () => {
    await window.SupabaseClient.init();
    const userResp = await window.SupabaseClient.auth.getUser();
    const user = userResp && userResp.data ? userResp.data.user : null;
    if (user) {
        window.SupabaseClient._cachedUserId = user.id;
        window.SupabaseClient._cachedUserEmail = user.email;
    }

    const commentsList = document.getElementById('comments-list');
    if (commentsList) {
        const postId = new URLSearchParams(window.location.search).get('id');
        CommentsManager.render(postId, 'comments-list');
    }

    CommentsManager.submitHandler('.comment-form');
});
