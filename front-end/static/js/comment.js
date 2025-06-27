function attachCommentListeners() {
  const commentButtons = document.querySelectorAll(".comment-button");
  const commentCounts = document.querySelectorAll(".comment-count");

  // Handle comment submission
  commentButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const postCard = button.closest(".post-card");
      const input = postCard.querySelector(".comment-input");
      const commentText = input.value.trim();
      const postId = parseInt(button.dataset.postId);

      if (!commentText) return;

      try {
        const response = await fetch("/api/v1/posts/addComment", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            post_id: postId,
            comment: commentText,
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw {
            code: errData.Code,
            message: errData.Message,
          };
        }

        const res = await response.json();
        input.value = "";

        const commentContainer = postCard.querySelector(`[data-comments-for="${postId}"]`);

        // If comments already loaded, prepend new comment
        if (commentContainer.dataset.loaded === "true") {
          const newComment = document.createElement("p");
          newComment.textContent = `You: ${commentText}`;
          commentContainer.prepend(newComment);
          commentContainer.classList.remove("hidden");
        }

        // Increment comment count visually
        const countSpan = postCard.querySelector(".comment-count");
        const currentCount = parseInt(countSpan.textContent) || 0;
        countSpan.textContent = currentCount + 1;

      } catch (error) {
        console.error(error);
      }
    });
  });

  // Handle click on comment count to fetch and show comments
  commentCounts.forEach((countSpan) => {
    countSpan.addEventListener("click", () => {
      const postCard = countSpan.closest(".post-card");
      const postIdElement = postCard.querySelector("[data-post-id]");
      const postId = parseInt(postIdElement.dataset.postId);
      const commentContainer = postCard.querySelector(`[data-comments-for="${postId}"]`);

      // If comments already loaded, just toggle visibility
      if (commentContainer.dataset.loaded === "true") {
        commentContainer.classList.toggle("hidden");
        return;
      }

      // Use your show function to fetch and render comments
      show(postId, commentContainer);
    });
  });
}
async function show(postId, commentContainer) {
  try {
    const response = await fetch(
      `/api/v1/posts/fetchComments?postId=${postId}`,
      { credentials: "include" }
    );

    if (!response.ok) {
      const errData = await response.json();
      throw { code: errData.Code, message: errData.Message };
    }

    const comments = await response.json();
    if (!comments) return;

    // Clear existing comments and render new ones
    commentContainer.innerHTML = "";
    comments.forEach(comment => {
      const p = document.createElement("p");
      p.textContent = `${comment.Creator}: ${comment.Content}`;
      commentContainer.appendChild(p);
    });

    commentContainer.classList.remove("hidden");
    commentContainer.dataset.loaded = "true";
  } catch (error) {
    showErrorPage(error);
  }
}



export {
    attachCommentListeners,
}
