async function showpostsPosts() {
      try {
    const response = await fetch("/api/v1/posts");
    if (!response.ok) {
      let err = {
        code: response.status,
        message: response.statusText,
      };
      throw err;
    }

    const posts = await response.json();
    return posts;
  } catch (error) {
    showErrorPage(error);
  }
    
}
async function renderPosts(section) {
    const post = document.createElement('div');
  const posts = await showpostsPosts();
  console.log(posts);
  
  if (!posts) return;

  post.innerHTML = ""; // Clear existing content

  posts.forEach(post => {
    const postCard = document.createElement("div");
    postCard.className = "post-card";
    postCard.innerHTML = `
      <h3>${post.title}</h3>
      <p>${post.content}</p>
      <small>Category: ${post.category}</small>
    `;
    section.appendChild(postCard);
  });
      const content = section.getElementsByClassName('content')[0];

    if (content) {
        content.appendChild(post);
    } else {
        // fallback: append directly to section if .content not found
        section.appendChild(post);
    }
}
export {
    renderPosts,
}
