import { main, routeTo } from "./main.js";
import { showChatWindow } from "./messages.js";
import { createpostrender } from "./posts.js";
function renderheader(section) {
  section.innerHTML = ` <section class="content">
        <div class="users">

        </div>
           <div class="main-container">

        </div>
            <div class="profile">

        </div>
       
       
      </section>`
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
  const content = section.querySelector('.profile');


  if (content) {
    content.append(profile);
  }
}
function getInitials(firstName, lastName) {
  const f = firstName ? firstName.charAt(0).toUpperCase() : '';
  const l = lastName ? lastName.charAt(0).toUpperCase() : '';
  return f + l;
}
async function renderUsers(section) {
  const senderId = sessionStorage.getItem("user_id");

  try {
    const response = await fetch("/api/v1/users", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ sender_id: parseInt(senderId) }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw { code: error.Code, message: error.Message };
    }

    const users = await response.json();
    if (!users) return;

    // Create container for user list
    const userListContainer = document.createElement("div");
    userListContainer.className = "users-list";

    const list = document.createElement("ul");
    list.className = "users-list-ul";

    users.forEach(user => {
      const li = document.createElement("li");
      li.className = "user-item";
      li.id = `active-${user.nickname}`;
      li.setAttribute("data-user-id", user.id);
      li.setAttribute("data-user-nickname", user.nickname);

      li.innerHTML = `
        <div class="avatar-wrapper">
          <img class="user-avatar" src="/front-end/static/assets/avatar.png" alt="Profile picture of ${user.nickname}" />
          <span class="status-dot ${user.online ? 'active' : 'offline'}"></span>
        </div>
        <span class="user-nickname">${user.nickname}</span>
      `;


      li.addEventListener("click", async (event) => {
        event.preventDefault();

        const target = event.target; // the exact clicked element
        const clickedUserItem = event.currentTarget; // the <li> that received the event

        const receiverId = parseInt(clickedUserItem.getAttribute("data-user-id"));
        const receiverNickname = clickedUserItem.getAttribute("data-user-nickname");

        // Debug info (optional)
        console.log("Event target:", target);
        console.log("User ID:", receiverId);

          showChatWindow(receiverId,receiverNickname)

      });


      list.appendChild(li);
    });

    userListContainer.appendChild(list);

    // Clear previous content and add new users
    const content = section.querySelector('.users');
    if (content) {
      content.innerHTML = ""; // clear previous
      content.append(userListContainer);
    }

  } catch (error) {
    console.error("Error fetching users:", error);
  }
}


export {
  renderUsers,
  renderheader,
  renderProfile,
}