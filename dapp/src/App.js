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

const accountContractAddress = "0x10bA3B891b604FE3b8b357606611ED8fAD72b42f";
const landContractAddress = "0x5d72fF0bB0626C7a87ccf5584C6839d06385A58c";

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
    </Routes>
  );
}

export default App;
