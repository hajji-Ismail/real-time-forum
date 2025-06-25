import { routeTo } from "./main.js";

async function isAouth() {
  try {
    const response = await fetch("/api/v1/users/info", {
      method: "GET",
      credentials: "include", // 👈 This tells the browser to send cookies
    });
    if (response.ok) {
      let data = await response.json();
      sessionStorage.setItem("user_id", data.id);
      return data;

    } else {

      return null;
    }
  } catch (err) {
    return null;

  }
}

function renderLoginPage(section = document.body, errors = {}) {
   section.innerHTML =  `
    <div class="modal-content">
      <form id="login_form_element">
        <h2><i class="fas fa-sign-in-alt"></i> Login</h2>

        <label for="login_id">Nickname or E-mail</label>
        <input type="text" id="login_id" name="login_id" required />
        <span id="err-login-id">${errors.Nickname || ""}</span>

        <label for="login_password">Password</label>
        <input type="password" id="login_password" name="password" required />
        <span id="err-login-pass">${errors.Pass || ""}</span>

        <button type="submit" id="sign-in">Login</button>
        <p id="login-error" style="color:red;"></p>
      </form>

      <div class="register_action"> 
        <p>Don't have an account?</p>
        <button class="secondary-btn" id="register_btn">
          <i class="fas fa-user-plus"></i> register
        </button>
      </div>
    </div>
  `;
  document.getElementById('register_btn').addEventListener('click', () => {
    routeTo("register");
  });

  const loginForm = document.getElementById('login_form_element');
  const loginError = document.getElementById('login-error');
  const loginButton = document.getElementById('sign-in');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.textContent = "";
    loginButton.disabled = true;

    const formData = new FormData(loginForm);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/v1/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Required to receive cookies
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.UserErrors?.HasError) {
          document.getElementById('err-login-id').textContent = result.UserErrors.Nickname || "";
          document.getElementById('err-login-pass').textContent = result.UserErrors.Pass || "";
          loginError.textContent = result.Message || "Login failed.";
          loginButton.disabled = false;
          return;
        }

        throw {
          code: result.Code,
          message: result.Message || "Unknown login error",
        };
      }

      localStorage.setItem("is_logged", "true");
      console.log("is_logged")
      routeTo("posts");
    } catch (err) {
      loginError.textContent = err.message || "Login failed. Please try again.";
    } finally {
      loginButton.disabled = false;
    }
  });
}

function renderRegisterpage(section = document.body, errors = {}) {

 section.innerHTML = `
  <div class="modal-content form-container">
    <form id="register_form_element" class="form-card">
      <h2><i class="fas fa-user-plus"></i> Create an Account</h2>

      <!-- Row: Nickname + Age -->
      <div class="form-row">
        <div class="form-group">
          <label for="nickname">Nickname</label>
          <input type="text" id="nickname" name="nickname" required />
          <small id="err-nickname" class="error-text">${errors.Nickname || ""}</small>
        </div>
        <div class="form-group">
          <label for="age">Age</label>
          <input type="number" id="age" name="age" min="1" max="120" required />
          <small id="err-age" class="error-text">${errors.Age || ""}</small>
        </div>
      </div>

      <!-- Row: First Name + Last Name -->
      <div class="form-row">
        <div class="form-group">
          <label for="first_name">First Name</label>
          <input type="text" id="first_name" name="first_name" required />
          <small id="err-firstname" class="error-text">${errors.FirstName || ""}</small>
        </div>
        <div class="form-group">
          <label for="last_name">Last Name</label>
          <input type="text" id="last_name" name="last_name" required />
          <small id="err-lastname" class="error-text">${errors.LastName || ""}</small>
        </div>
      </div>

      <!-- Row: Gender + Email -->
      <div class="form-row">
        <div class="form-group">
          <label for="gender">Gender</label>
          <select id="gender" name="gender" required>
            <option value="" disabled selected>Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <small id="err-gender" class="error-text">${errors.Gender || ""}</small>
        </div>
        <div class="form-group">
          <label for="email">E-mail</label>
          <input type="email" id="email" name="email" required />
          <small id="err-email" class="error-text">${errors.Email || ""}</small>
        </div>
      </div>

      <!-- Password (full width) -->
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" name="password" required />
        <small id="err-pass" class="error-text">${errors.Pass || ""}</small>
      </div>

      <!-- Submit Button -->
      <button type="submit" class="primary-btn full-width" id="sign-up">Register</button>
      <p id="register-error" class="error-text text-center"></p>
    </form>

    <div class="form-footer text-center">
      <p>Already have an account?</p>
      <button class="secondary-btn" id="login_btn_1">
        <i class="fas fa-sign-in-alt"></i> Login
      </button>
    </div>
  </div>
`;

  document.getElementById('login_btn_1').addEventListener('click', () => {
    routeTo("login");
  });

  const registerForm = document.getElementById('register_form_element');
  const registerError = document.getElementById('register-error');
  const registerButton = document.getElementById('sign-up');

  function clearFieldErrors() {
    ['nickname', 'age', 'gender', 'firstname', 'lastname', 'email', 'pass'].forEach(id => {
      const el = document.getElementById(`err-${id}`);
      if (el) el.textContent = '';
    });
    registerError.textContent = '';
  }

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFieldErrors();
    registerButton.disabled = true;

    const formData = new FormData(registerForm);
    const data = Object.fromEntries(formData.entries());
    data.age = parseInt(data.age);

    try {
      const response = await fetch("/api/v1/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (responseData.UserErrors?.HasError) {
          const ue = responseData.UserErrors;

          if (ue.Nickname) document.getElementById('err-nickname').textContent = ue.Nickname;
          if (ue.Age) document.getElementById('err-age').textContent = ue.Age;
          if (ue.Gender) document.getElementById('err-gender').textContent = ue.Gender;
          if (ue.FirstName) document.getElementById('err-firstname').textContent = ue.FirstName;
          if (ue.LastName) document.getElementById('err-lastname').textContent = ue.LastName;
          if (ue.Email) document.getElementById('err-email').textContent = ue.Email;
          if (ue.Pass) document.getElementById('err-pass').textContent = ue.Pass;

          registerError.textContent = responseData.Message || "Please fix the errors.";
          registerButton.disabled = false;
          return;
        }

        throw {
          code: responseData.Code,
          message: responseData.Message || "Unknown error.",
        };
      }

      // Registration success
      registerError.style.color = "green";
      registerError.textContent = responseData.Message || "Registration successful!";
      setTimeout(() => routeTo("login"), 1500);
    } catch (err) {
      registerError.textContent = err.message || "Registration failed.";
    } finally {
      registerButton.disabled = false;
    }
  });
}


export {
  isAouth,
  renderLoginPage,
  renderRegisterpage,
}