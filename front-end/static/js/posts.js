import { attachCommentListeners } from "./comment.js";
import { main, } from "./main.js";

async function showPosts() {
    try {
        const response = await fetch("/api/v1/posts");
        console.log(response);

        if (!response.ok) {
            let err = {
                code: response.status,
                message: response.statusText,
            };
            throw err;
        }

        const posts = await response.json();
        console.log(posts);

        return posts;
    } catch (error) {
        console.log(error);
    }

}
function createPost() {
    const formElement = document.getElementById("createPost_form_element");
    ;
    if (!formElement) return;

    formElement.addEventListener("submit", async (e) => {
        e.preventDefault();
        const title = formElement.querySelector("#title").value.trim();
        const content = formElement.querySelector("#content").value.trim();
        const categoryCheckboxes = formElement.querySelectorAll(
            'input[name="categories"]:checked'
        );
        const categories = Array.from(categoryCheckboxes).map((cb) => cb.value);

        const postData = {
            title,
            content,
            categories,
        };
        try {
            const response = await fetch("/api/v1/posts/create", {
                method: "POST",
                credentials: "include", // Very important
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(postData),
            });

            if (!response.ok) {
                const errorData = await response.json();

                if (errorData.UserErrors.HasError) {
                    showPostForm(errorData.UserErrors, true);
                    return;
                }

                const error = {
                    code: errorData.Code,
                    message: errorData.Message,
                };

                throw error;
            }
            main()
        } catch (err) {
            console.log(err);
        }
    });
}
async function renderPosts(section) {
  const postsWrapper = document.createElement('div');
  postsWrapper.className = 'posts-wrapper';

  const posts = await showPosts();

  if (!posts || posts.length === 0) {
    postsWrapper.innerHTML = `<p>No posts available.</p>`;
  } else {
    posts.forEach(post => {
      const postCard = document.createElement("div");
      postCard.className = "post-card";

      const date = new Date(post.CreatedAt).toLocaleString();

      const categoryTags = Array.isArray(post.categories)
        ? post.categories.map(cat => `<span class="category-tag">${cat}</span>`).join(" ")
        : `<span class="category-tag">Uncategorized</span>`;

      postCard.innerHTML = `
        <div class="post-header">
          <img
            src="/front-end/static/assets/avatar.png"
            alt="User Profile"
            class="profile-pic"
          />
          <div class="user-info">
            <h4 class="username">${post.Creator}</h4>
            <span class="post-date">Posted on ${date}</span>
            <span class="hidden" data-post-id="${post.ID}"></span>
          </div>
        </div>

        <div class="post-body">
          <h3 class="post-title">${post.title}</h3>
          <p class="post-content">${post.content}</p>
        </div>

        <div class="post-categories">
          ${categoryTags}
        </div>

        <div class="comment-section">
          <input type="text" placeholder="Write a comment..." class="comment-input" />
          <button class="comment-button" data-post-id="${post.ID}">
            <i class="fa-solid fa-paper-plane"></i>
          </button>
        </div>

      <div class="comments-list hidden" data-comments-for="${post.ID}"></div>


        <div class="post-footer">
       <span><i class="fa-solid fa-comment"></i> <span class="comment-count">${post.TotalComments}</span></span>

        </div>
      `;

      postsWrapper.appendChild(postCard);
    });
  }

  const content = section.querySelector(".main-container") || section;

  content.append(postsWrapper);

attachCommentListeners()
}

function createpostrender(section = document.body, errors = {}) {
    const create = document.createElement('div');

    create.innerHTML = `
    <h2>Create a Post</h2>
    <form id="createPost_form_element">
      <label for="title">Title:</label>
      <input type="text" id="title" name="title" maxlength="255" required />
      <span class="error-text">${errors.PostTilte || ""}</span>

      <label for="content">Content:</label>
      <textarea id="content" name="content" rows="6" required></textarea>
      <span class="error-text">${errors.PostContent || ""}</span>

      <label>Select Categories:</label>
      <div class="category-container">
        <div class="category-checkbox">
          <input type="checkbox" id="cat-tech" name="categories" value="Technology" />
          <label for="cat-tech">Technology</label>
        </div>
        <div class="category-checkbox">
          <input type="checkbox" id="cat-sci" name="categories" value="Science" />
          <label for="cat-sci">Science</label>
        </div>
        <div class="category-checkbox">
          <input type="checkbox" id="cat-health" name="categories" value="Health" />
          <label for="cat-health">Health</label>
        </div>
        <div class="category-checkbox">
          <input type="checkbox" id="cat-life" name="categories" value="Lifestyle" />
          <label for="cat-life">Lifestyle</label>
        </div>
        <div class="category-checkbox">
          <input type="checkbox" id="cat-edu" name="categories" value="Education" />
          <label for="cat-edu">Education</label>
        </div>
        <div class="category-checkbox">
          <input type="checkbox" id="cat-game" name="categories" value="Gaming" />
          <label for="cat-game">Gaming</label>
        </div>
        <div class="category-checkbox">
          <input type="checkbox" id="cat-biz" name="categories" value="Business" />
          <label for="cat-biz">Business</label>
        </div>
      </div>
      <span class="error-text">${errors.Postcategories || ""}</span>

      <button type="submit">Create Post</button>
    </form>
  `;
    const content = section.getElementsByClassName('posts-wrapper')[0];

    if (content) {
        content.prepend(create);
    } else {
        // fallback: append directly to section if .content not found
        section.prepend(create);
    }
    createPost()
}


export {
    renderPosts,
    createpostrender,
   
}
