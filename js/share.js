window.sharePost = async (postId) => {
  try {
    const url = `${location.origin}/?post=${postId}`;
    const title = "SupremeMotive Network";
    const text = "Check out this amazing post!";

    // Use native share API if available
    if (navigator.share) {
      await navigator.share({
        title: title,
        text: text,
        url: url,
      });
    } else {
      // Fallback: Copy to clipboard
      await navigator.clipboard.writeText(url);
      alert("✅ Link copied to clipboard!");
    }
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error("Error sharing:", error);
      alert("Error sharing post. Please try again.");
    }
  }
};

window.shareToSocial = (platform, postId) => {
  const url = encodeURIComponent(`${location.origin}/?post=${postId}`);
  const text = encodeURIComponent("Check out this inspiring post from SupremeMotive Network!");
  
  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    whatsapp: `https://api.whatsapp.com/send?text=${text} ${url}`,
  };

  if (shareUrls[platform]) {
    window.open(shareUrls[platform], "_blank", "width=600,height=400");
  } else {
    alert("Platform not supported");
  }
};
