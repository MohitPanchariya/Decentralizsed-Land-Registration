import React, { useState } from "react";
import Web3 from "web3";
import configuration from "../../AccountRegistration.json";
import "./Admin.css"
import phone_icon from "../Assets/telephone.png";
import user_icon from "../Assets/user.png";

const contractABI = configuration.abi; // Replace with your contract ABI

const AddLandInspector = ({accountContractAddress}) => {
  const [username, setUsername] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleAddLandInspector = async () => {
    try {
      const web3 = new Web3(window.ethereum);

      // Connect to the user's MetaMask provider
      await window.ethereum.request({ method: "eth_requestAccounts" });

      // Get the user's accounts
      const accounts = await web3.eth.getAccounts();
      const deployerAddress = accounts[0];

      // Create a contract instance
      const contract = new web3.eth.Contract(contractABI, accountContractAddress);

      // Call the addLandInspector function on the contract
      await contract.methods
        .addLandInspector(address, username, phoneNumber)
        .send({ from: deployerAddress });

      // Display success message or perform additional actions
      alert("Land Inspector added successfully!");
    } catch (error) {
      console.error("Error adding Land Inspector:", error);
      // Handle errors or display an error message to the user
      alert("Error adding Land Inspector");
    }
  };

  return (
    <div className="admin-container">
      <div className="header"><div className="text">Add Land Inspector</div><div className="underline-add"> </div></div>
      <div className="inputs">
      <div className="input">
              <img src={user_icon} alt="" />
              <input
                type="text"
                placeholder="USER NAME"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="input">
              <img src={user_icon} alt="" />
              <input
                type="text"
                placeholder="USER ADDRESS"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
      <div className="input">
              <img src={phone_icon} alt="" />
              <input
                type="number"
                placeholder="PHONE NUMBER"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
      <button className="submit-admin" onClick={handleAddLandInspector}>Add Land Inspector</button>
      </div>
    </div>
  );
};

export default AddLandInspector;
