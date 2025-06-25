import { isAouth, renderLoginPage, renderRegisterpage } from "./auth.js";

function routeTo(route) {
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
   
      break;
    case 'messages':
      
      break;
    default:
     
  }
}

async function main(){
    let data = await isAouth()
    if(!data){
     
        
        routeTo('login')
    } else {
        console.log('hi')
    }
}
export { routeTo}
main()

