import { isAouth, renderLoginPage, renderRegisterpage } from "./auth.js";

import { renderheader, renderProfile, renderUsers } from "./home.js";
import { establishConnection } from "./messages.js";
import { renderPosts } from "./posts.js";


async function routeTo(route, data) {
  let section = document.getElementById('app')
  switch (route) {
    case 'login':
      renderLoginPage(section)

      break;
    case 'register':

      renderRegisterpage(section)

      break;
    case 'posts':
  await renderPosts(section)
      break;
    case 'messages':

      await establishConnection()

    

      break;
   
    case 'home':
      renderheader(section)
      break
    case 'profile':
      renderProfile(section, data)
      break
    case 'users':
      renderUsers(section)
      break





    default:




  }
}

async function main() {
  let data = await isAouth()
  if (!data) {


    routeTo('login')
  } else {
    routeTo('messages')
    routeTo('home')
    routeTo('posts')
    routeTo('profile', data)
    routeTo('users')



  }
}
export { routeTo, main }
main()

