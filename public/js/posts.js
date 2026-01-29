// Posts manager using Supabase
const PostsManager = {
    renderFeed: async function(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        try {
            await window.SupabaseClient.init();
            const { data: posts, error } = await window.SupabaseClient.posts.list();
            if (error) throw error;

            if (!posts || posts.length === 0) {
                container.innerHTML = '<div class="no-posts"><p>No posts yet.</p></div>';
                return;
            }

            container.innerHTML = posts.map(post => {
                const mediaHtml = post.media_url ? `\n                    <div class="post-image">\n                        ${post.media_url.endsWith('.mp4') ? `<video src="${post.media_url}" controls muted playsinline style="width:100%;height:auto;">` : `<img src="${post.media_url}" alt="Post">`}\n                        ${post.media_url.endsWith('.mp4') ? '</video>' : ''}\n                    </div>` : '';

                return `
                    <div class="card post-card" data-post-id="${post.id}">
                        <div class="post-header">
                            <img src="assets/images/default.jpg" alt="Author" class="post-avatar">
                            <div class="post-meta">
                                <h3 class="post-author">${post.author_name || 'SupremeMotive'}</h3>
                                <span class="post-date">${new Date(post.created_at).toLocaleString()}</span>
                            </div>
                        </div>
                        ${mediaHtml}
                        <div class="post-content">
                            <h2>${post.title}</h2>
                            <p>${post.content}</p>
                        </div>
                        <div class="post-stats">
                            <span class="likes-count">❤️ ${post.likes_count || 0} Likes</span>
                            <span class="comments-count">💬 ${post.comments_count || 0} Comments</span>
                            <span class="share-count">↗️ Share</span>
                        </div>
                        <div class="post-actions">
                            <button class="action-btn like-btn" data-post-id="${post.id}">❤️ Like</button>
                            <button class="action-btn comment-btn" data-post-id="${post.id}">💬 Comment</button>
                            <button class="action-btn share-btn" data-post-id="${post.id}">↗️ Share</button>
                        </div>
                    </div>
                `;
            }).join('');

            this.attachEventListeners();
        } catch (err) {
            console.error(err);
            container.innerHTML = '<div class="error"><p>Failed to load posts.</p></div>';
        }
    },

    attachEventListeners: function() {
        document.querySelectorAll('.like-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const postId = e.currentTarget.dataset.postId;
                try {
                    const userResp = await window.SupabaseClient.auth.getUser();
                    const user = userResp && userResp.data ? userResp.data.user : null;
                    if (!user) {
                        // redirect to login with return url
                        const returnTo = encodeURIComponent(window.location.href);
                        window.location.href = `login.html?returnTo=${returnTo}`;
                        return;
                    }

                    await window.SupabaseClient.likes.toggle(postId);
                    // Update like count UI (simple refresh)
                    await PostsManager.renderFeed('posts-feed');
                } catch (err) {
                    console.error(err);
                    showNotification(err.message || 'Action failed', 'error');
                }
            });
        });

        document.querySelectorAll('.comment-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const postId = e.currentTarget.dataset.postId;
                const user = (await window.SupabaseClient.auth.getUser()).data.user;
                if (!user) {
                    const returnTo = encodeURIComponent(`post.html?id=${postId}`);
                    window.location.href = `login.html?returnTo=${returnTo}`;
                    return;
                }
                window.location.href = `post.html?id=${postId}`;
            });
        });

        document.querySelectorAll('.share-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const postId = e.currentTarget.dataset.postId;
                try {
                    const { data } = await window.SupabaseClient.posts.get(postId);
                    const post = data;
                    if (navigator.share) {
                        navigator.share({ title: post.title, text: post.content, url: window.location.href });
                    } else {
                        const url = `${window.location.origin}/post.html?id=${postId}`;
                        await navigator.clipboard.writeText(url);
                        showNotification('Post link copied to clipboard', 'success');
                    }
                } catch (err) {
                    console.error(err);
                    showNotification('Unable to share', 'error');
                }
            });
        });
    },

    renderAdminList: async function(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        await window.SupabaseClient.init();
        const { data: posts, error } = await window.SupabaseClient.posts.list();
        if (error) {
            container.innerHTML = '<p>Failed to load posts</p>';
            return;
        }

        container.innerHTML = posts.map(post => `
            <div class="table-row">
                <div class="col-title">${post.title}</div>
                <div class="col-author">${post.author_name || 'Admin'}</div>
                <div class="col-date">${new Date(post.created_at).toLocaleString()}</div>
                <div class="col-actions">
                    <button class="action-btn-small btn-edit" data-id="${post.id}">Edit</button>
                    <button class="action-btn-small btn-delete" data-id="${post.id}">Delete</button>
                </div>
            </div>
        `).join('');

        container.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if (!confirm('Delete this post?')) return;
                const id = e.currentTarget.dataset.id;
                try {
                    await window.SupabaseClient.posts.delete(id);
                    showNotification('Post deleted', 'success');
                    PostsManager.renderAdminList(containerId);
                } catch (err) {
                    console.error(err);
                    showNotification('Delete failed', 'error');
                }
            });
        });
    }
};
