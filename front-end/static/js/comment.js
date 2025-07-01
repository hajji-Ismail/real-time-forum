function attachCommentListeners() {
  const commentButtons = document.querySelectorAll(".comment-button");
  const commentLabels = document.querySelectorAll(".comment-label");

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
          body: JSON.stringify({ post_id: postId, comment: commentText }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.Message || "Failed to add comment");
        }

        input.value = "";

        const commentContainer = postCard.querySelector(`[data-comments-for="${postId}"]`);
        if (commentContainer.dataset.loaded === "true") {
          const newComment = document.createElement("p");
          newComment.textContent = `You: ${commentText}`;
          commentContainer.prepend(newComment);
          commentContainer.classList.remove("hidden");
        }

        const countSpan = postCard.querySelector(".comment-count");
        const currentCount = parseInt(countSpan.textContent) || 0;
        countSpan.textContent = currentCount + 1;

      } catch (err) {
        console.error(err);
      }
    });
  });

  // Handle label click to toggle comments
  commentLabels.forEach((label) => {
    label.addEventListener("click", async () => {
      const postCard = label.closest(".post-card");
      const postId = parseInt(label.dataset.postId);
      const commentContainer = postCard.querySelector(`[data-comments-for="${postId}"]`);

      if (commentContainer.classList.contains("hidden")) {
        if (commentContainer.dataset.loaded !== "true") {
          await show(postId, commentContainer);
          commentContainer.dataset.loaded = "true";
        }
        commentContainer.classList.remove("hidden");
      } else {
        commentContainer.classList.add("hidden");
      }
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
