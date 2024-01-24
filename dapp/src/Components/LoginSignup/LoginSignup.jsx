import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Web3 from "web3";
import configuration from "../../AccountRegistration.json";

const contractAddress = "0x9F4d677872ccfEDCA1b660A2a67AAD14D49812E9";
const contractABI = configuration.abi;

export const LoginSignup = () => {
  const [action, setAction] = useState("Sign Up");
  const [username, setUsername] = useState("");
  const [aadharNumber, setAadharNumber] = useState("");
  const [privateKey, setPrivateKey] = useState("");
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
        contractAddress
      );
      const userDetails = await contract.methods
        .getUserDetailsByAddress(account)
        .call();

      if (userDetails.aadharNumber) {
        console.log("Login successful!");
        // Redirect to the home page
        Navigate("/user-details");
      } else {
        console.error("User does not exist");
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
          contractAddress
        );

        // Call the setUserDetails function on the contract
        const gas = 2000000; // Adjust the gas limit as needed
        const transaction = await contract.methods
          .setUserDetails(username, aadharNumber)
          .send({ from: account, gas });

        // Check for transaction confirmation
        if (transaction.status) {
          console.log("User details set successfully!");
        } else {
          console.error("Transaction failed:", transaction);
          if (transaction.message) {
            console.error("Error message:", transaction.message);
          }
        }
      } else if (action === "Login") {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const account = accounts[0];
        const web3Instance = new Web3(window.ethereum);
        const contract = new web3Instance.eth.Contract(
          contractABI,
          contractAddress
        );
        const privateKeyWithPrefix = `0x${privateKey}`;
        const addressFromPrivateKey =
          await web3Instance.eth.accounts.privateKeyToAccount(
            privateKeyWithPrefix
          );

        if (
          account.toUpperCase() !== addressFromPrivateKey.address.toUpperCase()
        ) {
          console.error("Private key does not match MetaMask address");
          return;
        }
        const userDetails = await contract.methods
          .getUserDetailsByAddress(account)
          .call();

        if (userDetails.aadharNumber) {
          console.log("Login successful!");
          // Redirect to the home page
          Navigate("/user-details");
        } else {
          console.error("User does not exist");
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
            <div className="input">
              <img src={key_icon} alt="" />
              <input
                type="password"
                placeholder="PRIVATE KEY"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)} // Update private key state
              />
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
          {action === "Sign Up" ? (
            <div></div>
          ) : (
            <div className="or">
              <center>OR</center>
            </div>
          )}
          {action === "Sign Up" ? (
            <div className="input">
              <img src={aadhar_icon} alt="" />
              <input
                type="number"
                placeholder="AADHAR NUMBER"
                value={aadharNumber}
                onChange={(e) => setAadharNumber(e.target.value)}
              />
            </div>
          ) : (
            <div className="submit-container-metamask">
              {action === "Login" && (
                <div
                  className="submit-connect-metamask"
                  onClick={handleConnectMetaMask}
                >
                  Connect with MetaMask
                </div>
              )}
            </div>
          )}
        </div>
        <div className="submit-container">
          <button
            className={action === "Login" ? "submit" : "submit"}
            onClick={handleSubmit}
          >
            {action}
          </button>
          <div
            className={action === "Sign Up" ? "submit gray" : "submit gray"}
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
