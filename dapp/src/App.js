import './App.css';
import React from 'react';
import {Routes, Route} from "react-router-dom"
import Home from "./Components/Home/Home.jsx"
import {LoginSignup} from "./Components/LoginSignup/LoginSignup.jsx"
import {AddLandRecord} from "./Components/AddLands/AddLand.jsx"
import LandsForSale from './Components/LandsForSale/LandsForSale.jsx';
import UserDetails from './Components/UserDetails/UserDetails.jsx';

function App() {
  return (
    <Routes>
      <Route path='/' element={<LoginSignup/>} />
      <Route path='/user-details' element={<UserDetails/>} /> 
      <Route path="/home" element={<Home/>} />
      <Route path='/add-land' element={<AddLandRecord/>} />
      <Route path="/for-sale" element={<LandsForSale/>} />
    </Routes>
  );
}

export default App;
