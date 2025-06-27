import { isAouth, renderLoginPage, renderRegisterpage } from "./auth.js";

import { renderheader, renderProfile } from "./home.js";
import { establishConnection } from "./messages.js";
import { renderPosts } from "./posts.js";


async function routeTo(route , data) {
   let section =  document.getElementById('app')
  switch (route) {
    case 'login':
        renderLoginPage(section)

      break;
    case 'register':
      console.log("register");
      
      renderRegisterpage(section)
     
      break;
    case 'posts':
      console.log("posts");
    
      renderPosts(section)
   
      break;
    case 'messages':
      console.log('mesg');
      
      await establishConnection()
      
      
      break;
    case 'home' :
       renderheader(section)
       break
    case 'profile':
      renderProfile(section,data)
      break
    
  

    

    default:
     


     
  }
}

async function main(){
    let data = await isAouth()
    if(!data){
     
        
        routeTo('login')
    } else {
      routeTo('messages')
      routeTo('home')
      routeTo('profile' , data)
      routeTo('posts')
      
     
    }
}
export { routeTo , main}
main()

