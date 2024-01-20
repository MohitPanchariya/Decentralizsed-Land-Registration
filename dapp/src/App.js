import './App.css';
import React from 'react';
import {Routes, Route} from "react-router-dom"
import Home from "./Components/Home/Home.jsx"
import {LoginSignup} from "./Components/LoginSignup/LoginSignup.jsx"
import {AddLandRecord} from "./Components/AddLands/AddLand.jsx"
import LandsForSale from './Components/LandsForSale/LandsForSale.jsx';

function App() {
  return (
    <Routes>
      <Route path='/' element={<Home/>} />
      {/* <Route path='/login' element={<LoginSignup/>} /> */}
      <Route path="/home" element={<Home/>} />
      <Route path='/add-land' element={<AddLandRecord/>} />
      <Route path="/for-sale" element={<LandsForSale/>} />
    </Routes>
  );
}

export default App;
