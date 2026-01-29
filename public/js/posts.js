// Posts manager using Supabase
const PostsManager = {
    // Sample posts to match the UI design
    samplePosts: [
        {
            id: 'sample-1',
            title: 'Success Starts With Discipline',
            content: 'Discipline is the bridge between dreams and achievement. Learn how daily habits shape your future and unlock your true potential.',
            author_name: 'Supreme Motive',
            created_at: '2026-01-29T10:00:00Z',
            likes_count: 24,
            comments_count: 6,
            media_url: 'assets/images/success-mountain.jpg'
        }
    ],

    renderFeed: async function(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        try {
            await window.SupabaseClient.init();
            const { data: posts, error } = await window.SupabaseClient.posts.list();
            
            // Use sample posts if no database posts or error
            let postsToRender = posts && posts.length > 0 ? posts : this.samplePosts;
            
            if (error && !this.samplePosts.length) {
                console.error('Error loading posts:', error);
                postsToRender = this.samplePosts;
            }

            if (!postsToRender || postsToRender.length === 0) {
                container.innerHTML = '<div class="no-posts"><p>No posts yet.</p></div>';
                return;
            }

            container.innerHTML = postsToRender.map(post => {
                const mediaHtml = post.media_url ? `
                    <div class="post-image">
                        ${post.media_url.endsWith('.mp4') ? 
                            `<video src="${post.media_url}" controls muted playsinline style="width:100%;height:auto;">` : 
                            `<img src="${post.media_url}" alt="Post">`
                        }
                        ${post.media_url.endsWith('.mp4') ? '</video>' : ''}
                    </div>` : '';

                return `
                    <div class="card post-card" data-post-id="${post.id}">
                        <div class="post-header">
                            <div class="post-author-info">
                                <img src="assets/images/supreme-avatar.jpg" alt="Author" class="post-avatar">
                                <div class="post-meta">
                                    <span class="post-author">${post.author_name || 'Supreme Motive'}</span>
                                    <span class="post-date">${new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                                </div>
                            </div>
                        </div>
                        ${mediaHtml}
                        <div class="post-content">
                            <h2>${post.title}</h2>
                            <p>${post.content}</p>
                        </div>
                        <div class="post-stats">
                            <span class="likes-count">❤️ ${post.likes_count || 0}</span>
                            <span class="comments-count">💬 ${post.comments_count || 0}</span>
                            <span class="share-count">📤 Share</span>
                        </div>
                        <div class="post-actions">
                            <button class="action-btn like-btn" data-post-id="${post.id}">❤️ Like</button>
                            <button class="action-btn comment-btn" data-post-id="${post.id}">💬 Comment</button>
                            <button class="action-btn share-btn" data-post-id="${post.id}">📤 Share</button>
                        </div>
                    </div>
                `;
            }).join('');

            this.attachEventListeners();
        } catch (err) {
            console.error('Error in renderFeed:', err);
            // Fallback to sample posts
            container.innerHTML = this.samplePosts.map(post => `
                <div class="card post-card" data-post-id="${post.id}">
                    <div class="post-header">
                        <div class="post-author-info">
                            <img src="assets/images/supreme-avatar.jpg" alt="Author" class="post-avatar">
                            <div class="post-meta">
                                <span class="post-author">${post.author_name}</span>
                                <span class="post-date">${new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>
                    <div class="post-image">
                        <img src="${post.media_url}" alt="Post">
                    </div>
                    <div class="post-content">
                        <h2>${post.title}</h2>
                        <p>${post.content}</p>
                    </div>
                    <div class="post-stats">
                        <span class="likes-count">❤️ ${post.likes_count}</span>
                        <span class="comments-count">💬 ${post.comments_count}</span>
                        <span class="share-count">📤 Share</span>
                    </div>
                </div>
            `).join('');
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
