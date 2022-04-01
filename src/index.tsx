import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./components/App";
import { Provider } from "react-redux";
import store from "./redux/store";

declare global {
  interface Window {
    kakao: any;
  }
}

console.log(`
#####      ##     #####    ######   #####    ######   ######   ######  
##  ##    ####    ##  ##   ##       ##  ##   ##       ##       ##      
##  ##   ##  ##   ##  ##   ##       ##  ##   ##       ##       ##      
#####    ######   #####    ####     #####    ####     ####     ####    
####     ##  ##   ####     ##       ##  ##   ##       ##       ##      
## ##    ##  ##   ## ##    ##       ##  ##   ##       ##       ##      
##  ##   ##  ##   ##  ##   ######   #####    ######   ######   ##     

drrobot409@gmail.com\n\nhttps://github.com/RAREBEEF\n\nhttps://velog.io/@drrobot409
`);

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
