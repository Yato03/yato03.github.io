import React from 'react';
import ReactDOM from 'react-dom';
import Navigator from './navigator';
import Header from './Header';
import Root from './Root';
import Footer from './Footer';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <Navigator/> 
  </React.StrictMode>,  
  document.getElementById('navigator')
);

ReactDOM.render(
  <React.StrictMode>
    <Header/> 
  </React.StrictMode>,  
  document.getElementById('header')
);

ReactDOM.render(
  <React.StrictMode>
    <Root/> 
  </React.StrictMode>,  
  document.getElementById('root')
);

ReactDOM.render(
  <React.StrictMode>
    <Footer/> 
  </React.StrictMode>,  
  document.getElementById('footer')
);


reportWebVitals();
