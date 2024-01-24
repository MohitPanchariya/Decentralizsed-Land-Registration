import React from 'react';
import { Route, Routes } from "react-router-dom";
import './App.css';
import { AddLandRecord } from "./Components/AddLands/AddLand.jsx";
import Home from "./Components/Home/Home.jsx";
import LandsForSale from './Components/LandsForSale/LandsForSale.jsx';
import Received from './Components/Received/Received.jsx';
import Sent from './Components/Sent/Sent.jsx';
import TOO from './Components/TOO/TOO.jsx';

function App() {
  return (
    <Routes>
      <Route path='/' element={<Home/>} />
      {/* <Route path='/login' element={<LoginSignup/>} /> */}
      <Route path="/home" element={<Home/>} />
      <Route path='/add-land' element={<AddLandRecord/>} />
      <Route path="/for-sale" element={<LandsForSale/>} />
      <Route path='/req-received' element={<Received/>} /> 
      <Route path='/req-sent' element={<Sent/>} />
      <Route path='/too' element={<TOO/>} />
    </Routes>
  );
}

export default App;
