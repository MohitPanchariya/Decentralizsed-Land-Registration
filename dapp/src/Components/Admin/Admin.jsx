import React, { useState } from "react";
import Web3 from "web3";
import configuration from "../../AccountRegistration.json";
import "./Admin.css"
import phone_icon from "../Assets/telephone.png";
import user_icon from "../Assets/user.png";
import SidebarAdmin from "../SidebarAdmin/SidebarAdmin";

const contractABI = configuration.abi; // Replace with your contract ABI


const AddLandInspector = ({accountContractAddress}) => {
  const [username, setUsername] = useState("");
  const [addAddressLI, setAddAddressLI] = useState("");
  const [addAddressSLA, setAddAddressSLA] = useState("");
  const [grantAddressLI, setGrantAddressLI] = useState("");
  const [grantAddressSLA, setGrantAddressSLA] = useState("");
  const [revokeAddressLI, setRevokeAddressLI] = useState("");
  const [revokeAddressSLA, setRevokeAddressSLA] = useState("");
  const [removeAddressLI, setRemoveAddressLI] = useState("");
  const [removeAddressSLA, setRemoveAddressSLA] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleAdd = async (type) => {
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
      
      if (type === 0)
          await contract.methods
            .addLandInspector(addAddressLI, username, phoneNumber)
            .send({ from: deployerAddress });
      else
          await contract.methods
            .addSecondLevelAuthority(addAddressSLA, username, phoneNumber)
            .send({ from: deployerAddress });

      // Display success message or perform additional actions
      alert("Land Inspector added successfully!");
    } catch (error) {
      console.error("Error adding Land Inspector:", error);
      // Handle errors or display an error message to the user
      alert("Error adding Land Inspector");
    }
  };
  
  
  const handleGrant = async (type) => {
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
      console.log(type);
      
      if (type === 0)
          await contract.methods
            .grantLandInspectorStatus(grantAddressLI)
            .send({ from: deployerAddress });
      else
          await contract.methods
                .grantSecondLevelAuthorityStatus(grantAddressSLA)
                .send({ from: deployerAddress });
          

      // Display success message or perform additional actions
      alert("Land Inspector status granted successfully!");
    } catch (error) {
      console.error("Error granting Land Inspector:", error);
      // Handle errors or display an error message to the user
      alert("Error granting Land Inspector");
    }
  };
  
  const handleRevoke = async (type) => {
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
      if (type === 0)
          await contract.methods
            .revokeLandInspectorStatus(revokeAddressLI)
            .send({ from: deployerAddress });
      else
          await contract.methods
            .revokeSecondLevelAuthorityStatus(revokeAddressSLA)
            .send({ from: deployerAddress });


      // Display success message or perform additional actions
      alert("Land Inspector status revoked successfully!");
    } catch (error) {
      console.error("Error revoking Land Inspector:", error);
      // Handle errors or display an error message to the user
      alert("Error revoking Land Inspector");
    }
  };
  
  
  const handleRemove = async (type) => {
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
      if (type === 0)
          await contract.methods
            .removeLandInspector(removeAddressLI)
            .send({ from: deployerAddress });
      else
        await contract.methods
            .removeSecondLevelAuthority(removeAddressSLA)
            .send({ from: deployerAddress });

      // Display success message or perform additional actions
      alert("Land Inspector removed successfully!");
    } catch (error) {
      console.error("Error removing Land Inspector:", error);
      // Handle errors or display an error message to the user
      alert("Error removing Land Inspector");
    }
  };
  
  

  return (
    <div>
      <SidebarAdmin />
    <div className="admin-container">
    <div className="admin-card">
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
                value={addAddressLI}
                onChange={(e) => setAddAddressLI(e.target.value)}
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
      <button className="submit-admin" onClick={() => handleAdd(0)}>Add Land Inspector</button>
      </div>
      </div>
      <div className="admin-card">
      <div className="header"><div className="text">Grant Land Inspector</div><div className="underline-add"> </div></div>
      
      <div className="inputs">
     
            <div className="input">
              <img src={user_icon} alt="" />
              <input
                type="text"
                placeholder="USER ADDRESS"
                value={grantAddressLI}
                onChange={(e) => setGrantAddressLI(e.target.value)}
              />
            </div>
      <button className="submit-admin" onClick={() => handleGrant(0)}>Grant Land Inspector Status</button>
      </div>
      </div>
      <div className="header"><div className="text">Revoke Land Inspector</div><div className="underline-add"> </div></div>
      
      <div className="inputs">
     
            <div className="input">
              <img src={user_icon} alt="" />
              <input
                type="text"
                placeholder="USER ADDRESS"
                value={revokeAddressLI}
                onChange={(e) => setRevokeAddressLI(e.target.value)}
              />
            </div>
      <button className="submit-admin" onClick={() => handleRevoke(0)}>Revoke Land Inspector Status</button>
      </div>
      
      
      <div className="header"><div className="text">Remove Land Inspector</div><div className="underline-add"> </div></div>
      <div className="inputs">
     
            <div className="input">
              <img src={user_icon} alt="" />
              <input
                type="text"
                placeholder="USER ADDRESS"
                value={removeAddressLI}
                onChange={(e) => setRemoveAddressLI(e.target.value)}
              />
            </div>
      <button className="submit-admin" onClick={() => handleRemove(0)}>Remove Land Inspector</button>
      </div>
      
      <div className="header"><div className="text">Add Second Level Authority</div><div className="underline-add"> </div></div>
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
                value={addAddressSLA}
                onChange={(e) => setAddAddressSLA(e.target.value)}
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
      <button className="submit-admin" onClick={() => handleAdd(1)}>Add Second Level Authority</button>
      </div>
      
      <div className="header"><div className="text">Grant Second Level Authority</div><div className="underline-add"> </div></div>
      
      <div className="inputs">
     
            <div className="input">
              <img src={user_icon} alt="" />
              <input
                type="text"
                placeholder="USER ADDRESS"
                value={grantAddressSLA}
                onChange={(e) => setGrantAddressSLA(e.target.value)}
              />
            </div>
      <button className="submit-admin" onClick={() => handleGrant(1)}>Grant Second Level Authority Status</button>
      </div>
      
      <div className="header"><div className="text">Revoke Second Level Authority</div><div className="underline-add"> </div></div>
      
      <div className="inputs">
     
            <div className="input">
              <img src={user_icon} alt="" />
              <input
                type="text"
                placeholder="USER ADDRESS"
                value={revokeAddressSLA}
                onChange={(e) => setRevokeAddressSLA(e.target.value)}
              />
            </div>
      <button className="submit-admin" onClick={() => handleRevoke(1)}>Revoke Second Level Authority Status</button>
      </div>
      
      
      <div className="header"><div className="text">Remove Second Level Authority</div><div className="underline-add"> </div></div>
      <div className="inputs">
     
            <div className="input">
              <img src={user_icon} alt="" />
              <input
                type="text"
                placeholder="USER ADDRESS"
                value={removeAddressSLA}
                onChange={(e) => setRemoveAddressSLA(e.target.value)}
              />
            </div>
      <button className="submit-admin" onClick={() => handleRemove(1)}>Remove Second Level Authority</button>
      </div>
      
    </div>
    </div>
    
    
  );
};

export default AddLandInspector;
