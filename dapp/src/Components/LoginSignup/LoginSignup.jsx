import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Web3 from "web3";
import configuration from "../../AccountRegistration.json";
import phone_icon from "../Assets/telephone.png";
import metamask_icon from "../Assets/metamask.png";
import user_icon from "../Assets/user.png";
import "./LoginSignup.css";

//const accountContractAddress = "0x9F4d677872ccfEDCA1b660A2a67AAD14D49812E9";
const contractABI = configuration.abi;

export const LoginSignup = ({accountContractAddress}) => {
  const [action, setAction] = useState("Sign Up");
  const [username, setUsername] = useState("");
  const [phoneNumber, setphoneNumber] = useState("");
  const Navigate = useNavigate();

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
      console.log(userDetails.designation);
      if (userDetails.phoneNumber && userDetails.designation.toString()!=='0') {
        console.log("Login successful!");
        alert("Login successful!");
        // Redirect to the home page
        Navigate("/admin");
      } else if(userDetails.phoneNumber) {
        console.log("Login successful!");
        alert("Login successful!");
        Navigate("/user-details");
      }
      else {
        console.error("User does not exist");
        alert("User does not exist!");
      }
    } catch (error) {
      console.error("Error connecting with MetaMask:", error);
    }
  };

  const handleSubmit = async (event) => {
    try {
      event.preventDefault();
      if (action === "Sign Up") {
        // Request MetaMask account access
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const account = accounts[0];

        // Create a Web3 instance using the provider from MetaMask
        const web3Instance = new Web3(window.ethereum);

        // Connect to your contract using the Web3 instance
        const contract = new web3Instance.eth.Contract(
          contractABI,
          accountContractAddress
        );

        // Call the setUserDetails function on the contract
        const gas = 2000000; // Adjust the gas limit as needed
        const transaction = await contract.methods
          .setUserDetails(username, phoneNumber)
          .send({ from: account, gas });

        // Check for transaction confirmation
        if (transaction.status) {
          console.log("User details set successfully!");
          alert("User details set successfully!");
        } else {
          console.error("Transaction failed:", transaction);
          if (transaction.message) {
            console.error("Error message:", transaction.message);
          }
        }
      } 
    } catch (error) {
      console.error("Error setting user details:", error);
    }
  };

  return (
    <div className="signUp">
      <div className="container">
        <div className="header">
          <div className="text">{action}</div>
          <div className="underline"> </div>
        </div>
        <div className="inputs">
          {action === "Login" ? (
            <div className="metamask-container">
              <img src={metamask_icon} alt="" />
            </div>
          ) : (
            <div className="input">
              <img src={user_icon} alt="" />
              <input
                type="text"
                placeholder="USER NAME"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          )}
          {action === "Sign Up" && (
            <div className="input">
              <img src={phone_icon} alt="" />
              <input
                type="number"
                placeholder="PHONE NUMBER"
                value={phoneNumber}
                onChange={(e) => setphoneNumber(e.target.value)}
              />
            </div>
          )}
        </div>
        <div className="submit-container">
          {action === "Sign Up" && (
            <button className="submit" onClick={handleSubmit}>
              Sign Up
            </button>
          )}
          {action === "Login" && (
            <div
              className="submit-connect-metamask"
              onClick={handleConnectMetaMask}
            >
              Connect with MetaMask
            </div>
          )}
          <div
            className={action === "Sign Up" ? "submit gray" : "submit login"}
            onClick={() => setAction(action === "Login" ? "Sign Up" : "Login")}
          >
            {action === "Login" ? "Sign Up" : "Login"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;