import React from 'react';
import { Route, Routes } from "react-router-dom";
import './App.css';
import { AddLandRecord } from "./Components/AddLands/AddLand.jsx";
import Admin from "./Components/Admin/Admin.jsx";
import Home from "./Components/Home/Home.jsx";
import LandsForSale from './Components/LandsForSale/LandsForSale.jsx';
import LoginSignup from './Components/LoginSignup/LoginSignup.jsx';
import Received from './Components/Received/Received.jsx';
import Sent from './Components/Sent/Sent.jsx';
import TOO from './Components/TOO/TOO.jsx';
import UserDetails from './Components/UserDetails/UserDetails.jsx';
import UserVerification from './Components/UserVerification/UserVerification.jsx';
import LandVerification from './Components/LandVerification/LandVerification.jsx';

const accountContractAddress = "0x570698C5a82e53eec1C1456a36781FC2D59978A9";
const landContractAddress = "0x1BC7C27c40B76e317854730d71f7AB7a332A68d1";

function App() {
  return (
    <Routes>
      <Route path='/' element={<LoginSignup accountContractAddress={accountContractAddress}/>} />
      <Route path='/user-details' element={<UserDetails accountContractAddress={accountContractAddress}/>} /> 
      <Route path="/home" element={<Home landContractAddress={landContractAddress}/>} />
      <Route path='/add-land' element={<AddLandRecord landContractAddress={landContractAddress}/>} />
      <Route path="/for-sale" element={<LandsForSale landContractAddress={landContractAddress}/>} />
      <Route path="/admin" element={<Admin accountContractAddress={accountContractAddress}/>} />
      <Route path='/req-received' element={<Received landContractAddress={landContractAddress}/>} /> 
      <Route path='/req-sent' element={<Sent landContractAddress={landContractAddress}/>} />
      <Route path='/too' element={<TOO landContractAddress={landContractAddress}/>} />
      <Route path='/user-verification' element={<UserVerification accountContractAddress={accountContractAddress}/>} />
      <Route path='/land-verification' element={<LandVerification landContractAddress={landContractAddress}/>} />
    </Routes>
  );
}

export default App;
