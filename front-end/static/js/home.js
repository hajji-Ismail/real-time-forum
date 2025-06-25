import { main, routeTo } from "./main.js";
import { createpostrender } from "./posts.js";
function renderheader(section) {
    section.innerHTML = ``
    const header = document.createElement('header');
    header.className = "main-header";

header.innerHTML = `
  <div class="header-content">
    <div class="logo" id="logo">💬 ForumApp</div>
    
   
    
    <nav class="nav-links">
     <div class="open-post-form" id="open-post-form">
      <button id="create-post-btn" title="Create Post" class="nav-btn">
        <i class="fas fa-plus"></i> Create
      </button>
    </div>
      <button class="nav-btn" id="logout-btn">Logout</button>
    </nav>
  </div>
`;

    section.prepend(header);
    document.getElementById('logo').addEventListener('click', () => {
       main(); // assuming "posts" is root/main forum page
    });
    document.getElementById("open-post-form").addEventListener("click", () => {
        createpostrender(section); 
          document.getElementById("open-post-form").style.display = 'none'
        // Your existing function to show the form
    });


    document.getElementById('logout-btn').addEventListener('click', async () => {
        try {
            const response = await fetch("/api/v1/users/logout", {
                method: "GET",
                credentials: "include",
            });

            if (response.ok) {
                routeTo("login")
                localStorage.removeItem("is_logged");
            } else {
                const errorData = await response.json();
                throw { code: errorData.Code, message: errorData.Message };
            }
        } catch (err) {
            console.log(err);

        }
    });
}

function renderProfile(section = document.body, user) {
    const profile = document.createElement('div');
    profile.className = 'profile-container';  // optional to style the container

    profile.innerHTML = `
    <h2>Profile</h2>
    <div class="profile-image">
      <div class="avatar">${getInitials(user.first_name, user.last_name)}</div>
    </div>
    <div class="profile-info">
      <p><strong>Nickname:</strong> ${user.nickname}</p>
      <p><strong>Full Name:</strong> ${user.first_name} ${user.last_name}</p>
      <p><strong>Age:</strong> ${user.age}</p>
      <p><strong>Gender:</strong> ${user.gender}</p>
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>Created At:</strong> ${new Date(user.created_at).toLocaleString()}</p>
    </div>
  `;
    // If you want to append inside a container with class 'content' inside section:
    const content = section.getElementsByClassName('content')[0];

    if (content) {
        content.appendChild(profile);
    } else {
        // fallback: append directly to section if .content not found
        section.appendChild(profile);
    }
}
function getInitials(firstName, lastName) {
    const f = firstName ? firstName.charAt(0).toUpperCase() : '';
    const l = lastName ? lastName.charAt(0).toUpperCase() : '';
    return f + l;
}

export {
    renderheader,
    renderProfile,
}