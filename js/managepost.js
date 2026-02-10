import { supabase } from "../config/supabase.js";

window.initManagePost = async () => {
  try {
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData.user) {
      alert("Please login to manage posts");
      location.href = "/";
      return;
    }

    await loadAllPosts();
  } catch (error) {
    console.error("Init error:", error);
    alert("Error loading page. Please try again.");
  }
};

window.loadAllPosts = async () => {
  try {
    const { data: posts, error } = await supabase
      .from("posts")
      .select("id, title, content, created_at, user_id")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const postList = document.getElementById("postList");
    if (!postList) return;

    if (!posts || posts.length === 0) {
      postList.innerHTML = "<p>No posts yet. Create one to get started!</p>";
      return;
    }

    postList.innerHTML = posts
      .map(
        (post) => `
        <div class="post-item" data-post-id="${post.id}">
          <div class="post-info">
            <h3>${post.title}</h3>
            <p>${post.content.substring(0, 100)}...</p>
            <small>${new Date(post.created_at).toLocaleDateString()}</small>
          </div>
          <div class="post-actions">
            <button class="edit-btn" onclick="editPost('${post.id}')">✏️ Edit</button>
            <button class="delete-btn" onclick="deletePostItem('${post.id}')">🗑️ Delete</button>
          </div>
        </div>
      `
      )
      .join("");
  } catch (error) {
    console.error("Error loading posts:", error);
    const postList = document.getElementById("postList");
    if (postList) {
      postList.innerHTML = "<p class='error'>Error loading posts. Please try again.</p>";
    }
  }
};

window.deletePostItem = async (postId) => {
  if (!confirm("Are you sure you want to delete this post? This cannot be undone.")) {
    return;
  }

  try {
    const { error } = await supabase.from("posts").delete().eq("id", postId);

    if (error) throw error;
    alert("✅ Post deleted successfully!");
    await loadAllPosts();
  } catch (error) {
    console.error("Error deleting post:", error);
    alert("Error deleting post. Please try again.");
  }
};

window.editPost = async (postId) => {
  try {
    const { data: post, error } = await supabase
      .from("posts")
      .select("title, content")
      .eq("id", postId)
      .single();

    if (error) throw error;

    const newTitle = prompt("Edit title:", post.title);
    if (!newTitle) return;

    const newContent = prompt("Edit content:", post.content);
    if (!newContent) return;

    const { error: updateError } = await supabase
      .from("posts")
      .update({ title: newTitle, content: newContent })
      .eq("id", postId);

    if (updateError) throw updateError;
    alert("✅ Post updated successfully!");
    await loadAllPosts();
  } catch (error) {
    console.error("Error editing post:", error);
    alert("Error editing post. Please try again.");
  }
};

window.createNewPost = async () => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      alert("Please login to create posts");
      return;
    }

    const title = prompt("Enter post title:");
    if (!title) return;

    const content = prompt("Enter post content:");
    if (!content) return;

    const { error } = await supabase.from("posts").insert([
      {
        title,
        content,
        user_id: user.user.id,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) throw error;
    alert("✅ Post created successfully!");
    await loadAllPosts();
  } catch (error) {
    console.error("Error creating post:", error);
    alert("Error creating post. Please try again.");
  }
};

// Auto-initialize
document.addEventListener("DOMContentLoaded", () => {
  const postList = document.getElementById("postList");
  if (postList) {
    initManagePost();
  }
});
