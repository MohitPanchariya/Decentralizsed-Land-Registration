import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import Web3 from "web3";
import configuration from "../../AccountRegistration.json";
import Home from "../Home/Home";
import user_icon from "../Assets/user.png";
import SidebarAdmin from "../SidebarAdmin/SidebarAdmin";

const contractAddress = "0x5a9d59b36224d63766b165432Cb717DE8b723b69";
const contractABI = configuration.abi;

export const Admin = ({accountContractAddress}) => {
  const [action, setAction] = useState("");
  const [username, setUsername] = useState("");
  const [aadharNumber, setAadharNumber] = useState("");
  const [address, setAddress] = useState("");
  const [authority, setAuthority] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [list, setList] = useState([]);
  const Navigate = useNavigate();

  const [userDetails, setUserDetails] = useState(null);

  const handleConnectMetaMask = async () => {
    try {
        
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const account = accounts[0];
      console.log("Connected with MetaMask:", account);
      const web3Instance = new Web3(window.ethereum);
      const contract = new web3Instance.eth.Contract(
        contractABI,
        accountContractAddress
      );
      const userDetails = await contract.methods
        .getUserDetailsByAddress(account)
        .call();

      if (userDetails.aadharNumber) {
        console.log("Login successful!");
        setUserDetails(userDetails); 
        Navigate("/home");
      } else {
        console.error("User does not exist");
      }
    } catch (error) {
      console.error("Error connecting with MetaMask:", error);
    }
  };

  const handleSubmit = async (event, type) => {
    try {
    
    console.log(username)
    console.log(address)
    console.log(aadharNumber)
    console.log(type)
      event.preventDefault();
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const account = accounts[0];

        const web3Instance = new Web3(window.ethereum);

        const contract = new web3Instance.eth.Contract(
          contractABI,
          accountContractAddress
        );

        const gas = 2000000; 
        let transaction;
        if (type == 0)
            transaction = await contract.methods
          .addSecondLevelAuthority(address, username, aadharNumber)
          .send({ from: account, gas });
        else
            transaction = await contract.methods
          .addSecondLevelAuthority(address, username, aadharNumber)
          .send({ from: account, gas });

        if (transaction.status) {
          console.log("Added successfully!");
        } else {
          console.error("Transaction failed:", transaction);
          if (transaction.message) {
            console.error("Error message:", transaction.message);
          }
        }
 
    } catch (error) {
      console.error("Error :", error);
    }
  };
  
  
  const  getPendingVerifications = async() => {
  try {
  const web3Instance = new Web3(window.ethereum);

        const contract = new web3Instance.eth.Contract(
          contractABI,
          contractAddress
        );
    const result = await contract.methods.getPendingVerifications().call();
    console.log(result);
    
    setList(result);

    
  } catch (error) {
    console.error(error);
  }
    };

  return (
    <div className="admin-container">
      <SidebarAdmin/>
      {userDetails ? ( 
        <Home userDetails={userDetails} />
      ) : (
        <>
          <div className="header">
            <div className="text">Add Second Level Authority</div>
            <div className="underline"> </div>
          </div>
          <div className="inputs">
            {
              <div className="input">
                <img src={user_icon} alt="" />
                <input
                  type="text"
                  placeholder="Username"
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              
            }
            {
              <div className="input">
                <img src={user_icon} alt="" />
                <input
                  type="text"
                  placeholder="Address"
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              
            }
            {
              <div className="input">
                <img src={user_icon} alt="" />
                <input
                  type="text"
                  placeholder="Aadhar"
                  onChange={(e) => setAadharNumber(e.target.value)}
                />
              </div>
              
            }
            
          </div>
          <div className="submit-container">
            <button
              className={"submit"}
              onClick={(e) => handleSubmit(e, 0)}
            >
              Add
            </button>
            
          </div>
          
          <div className="header">
            <div className="text">Add Land Inspector</div>
            <div className="underline"> </div>
          </div>
          <div className="inputs">
            {
              <div className="input">
                <img src={user_icon} alt="" />
                <input
                  type="text"
                  placeholder="Username"
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              
            }
            {
              <div className="input">
                <img src={user_icon} alt="" />
                <input
                  type="text"
                  placeholder="Address"
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              
            }
            {
              <div className="input">
                <img src={user_icon} alt="" />
                <input
                  type="text"
                  placeholder="Aadhar"
                  onChange={(e) => setAadharNumber(e.target.value)}
                />
              </div>
              
            }
            
          </div>
          <div className="submit-container">
            <button
              className={"submit"}
              onClick={(e) => handleSubmit(e, 1)}
            >
              Add
            </button>
            
          </div>
        </>
        
      )}
      
      <ul>{list.length > 0 && list.map((item) => <li>{item.userAddress} </li>)}</ul>
    </div>
  );
};

export default Admin;
