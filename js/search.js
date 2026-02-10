import { supabase } from "../config/supabase.js";

let searchTimeout;

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search");
  if (!searchInput) return;

  searchInput.addEventListener("input", async (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();

    if (query.length === 0) {
      // Reload all posts if search is cleared
      await loadPosts();
      return;
    }

    searchTimeout = setTimeout(async () => {
      await performSearch(query);
    }, 300); // Debounce search
  });
});

window.performSearch = async (query) => {
  try {
    const { data: posts, error } = await supabase
      .from("posts")
      .select("id, title, content, created_at, user_id, user:user_id(email)")
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;

    const feed = document.getElementById("feed");
    if (!feed) return;

    if (!posts || posts.length === 0) {
      feed.innerHTML = `<p class='no-results'>No results found for "${query}". Try different keywords!</p>`;
      return;
    }

    feed.innerHTML = posts
      .map(
        (post) => `
        <article class="post" data-post-id="${post.id}">
          <div class="post-body">
            <h2 class="post-title">${post.title}</h2>
            <p class="post-author">By ${post.user?.email || "Anonymous"}</p>
            <div class="post-meta">${new Date(post.created_at).toLocaleDateString()}</div>
            <p class="post-text">${post.content.substring(0, 200)}...</p>
          </div>
          <div class="post-actions">
            <button class="like-btn" onclick="likePost('${post.id}')">❤️ Like</button>
            <button class="comment-btn" onclick="openComments('${post.id}')">💬 Comment</button>
            <button class="share-btn" onclick="sharePost('${post.id}')">↗️ Share</button>
          </div>
        </article>
      `
      )
      .join("");
  } catch (error) {
    console.error("Search error:", error);
    const feed = document.getElementById("feed");
    if (feed) {
      feed.innerHTML = "<p class='error'>Error searching. Please try again.</p>";
    }
  }
};
