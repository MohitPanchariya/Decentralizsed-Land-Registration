import './App.css';
import React from 'react';
import { BrowserRouter} from 'react-router-dom';
import LoginSignup from './Components/LoginSignup/LoginSignup'


function App() {
  return (
    <BrowserRouter>
      <LoginSignup />
    </BrowserRouter>
  );
}

export default App;
