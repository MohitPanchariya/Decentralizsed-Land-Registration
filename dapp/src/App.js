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

const accountContractAddress = "0xbF37F5cEd0461a0A40e5036a6158414A5a5D0FF3";
const landContractAddress = "0x548FA1FA4c741C4cd829115dcC7e1272C973bb8A";

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