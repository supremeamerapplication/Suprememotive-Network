import { supabase } from "../config/supabase.js";

window.loadPosts = async (limit = 20) => {
  try {
    const { data: posts, error } = await supabase
      .from("posts")
      .select(
        `
        id, title, content, media, created_at, user_id,
        user:user_id(email, id),
        likes:likes(count),
        comments:comments(count)
        `
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    const feed = document.getElementById("feed");
    if (!feed) return;

    if (!posts || posts.length === 0) {
      feed.innerHTML = "<p class='no-posts'>No posts yet. Create one to get started!</p>";
      return;
    }

    feed.innerHTML = posts
      .map(
        (post) => `
        <article class="post" data-post-id="${post.id}">
          ${
            post.media
              ? `
            <div class="post-media">
              <img src="https://YOUR_PROJECT_ID.supabase.co/storage/v1/object/public/media/${post.media}" alt="${post.title}">
            </div>
            `
              : ""
          }
          <div class="post-body">
            <h2 class="post-title">${post.title}</h2>
            <p class="post-author">By ${post.user?.email || "Anonymous"}</p>
            <div class="post-meta">${new Date(post.created_at).toLocaleDateString()}</div>
            <p class="post-text">${post.content}</p>
          </div>
          <div class="post-actions">
            <button class="like-btn" onclick="likePost('${post.id}')">❤️ ${
          post.likes?.[0]?.count || 0
        }</button>
            <button class="comment-btn" onclick="openComments('${post.id}')">💬 ${
          post.comments?.[0]?.count || 0
        }</button>
            <button class="share-btn" onclick="sharePost('${post.id}')">↗️ Share</button>
          </div>
        </article>
      `
      )
      .join("");
  } catch (error) {
    console.error("Error loading posts:", error);
    const feed = document.getElementById("feed");
    if (feed) {
      feed.innerHTML = "<p class='error'>Error loading posts. Please refresh.</p>";
    }
  }
};

window.createPost = async (title, content, media = null) => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      alert("Please login to create posts");
      return;
    }

    const { data, error } = await supabase.from("posts").insert([
      {
        title,
        content,
        media,
        user_id: user.user.id,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) throw error;
    alert("✅ Post created successfully!");
    await loadPosts();
    return data;
  } catch (error) {
    console.error("Error creating post:", error);
    alert("Error creating post. Please try again.");
  }
};

window.deletePost = async (postId) => {
  try {
    if (!confirm("Are you sure you want to delete this post?")) return;

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      alert("Please login");
      return;
    }

    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId)
      .eq("user_id", user.user.id);

    if (error) throw error;
    alert("✅ Post deleted successfully!");
    await loadPosts();
  } catch (error) {
    console.error("Error deleting post:", error);
    alert("Error deleting post. Please try again.");
  }
};

// Auto-load posts when page loads
document.addEventListener("DOMContentLoaded", () => {
  const feed = document.getElementById("feed");
  if (feed) {
    loadPosts();
  }
});
