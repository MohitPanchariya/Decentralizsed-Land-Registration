import React, { useState, useEffect } from "react";
import Web3 from "web3";
import configuration from "../../AccountRegistration.json";
import SidebarAdmin from "../SidebarAdmin/SidebarAdmin";
import "./UserVerification.css";

const contractABI = configuration.abi; // Replace with your contract address

const UserVerification = ({ accountContractAddress }) => {
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [web3, setWeb3] = useState(null);

  useEffect(() => {
    const initializeWeb3 = async () => {
      if (window.ethereum) {
        try {
          // Request account access if needed
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);
        } catch (error) {
          console.error("Error connecting to MetaMask:", error);
        }
      } else {
        console.error("MetaMask not detected!");
      }
    };

    initializeWeb3();
  }, []);

  useEffect(() => {
    // Function to fetch pending verifications from the smart contract
    const fetchPendingVerifications = async () => {
      try {
        if (web3) {
          const contract = new web3.eth.Contract(contractABI, accountContractAddress);

          // Call the getPendingVerifications function on the contract
          const result = await contract.methods.getPendingVerifications().call();
          setPendingVerifications(result);
        }
      } catch (error) {
        console.error("Error fetching pending verifications:", error);
      }
    };

    // Call the fetchPendingVerifications function when the component mounts
    fetchPendingVerifications();
  }, [web3, accountContractAddress]); // Update on web3 or accountContractAddress changes

  // Function to handle the "Approve" button click
  const handleApproveClick = async (phoneNumber) => {
    try {
      if (web3) {
        const contract = new web3.eth.Contract(contractABI, accountContractAddress);

        // Call the verifyAccount function on the contract
        const result = await contract.methods.verifyAccount(phoneNumber).send({ from: (await web3.eth.getAccounts())[0] });

        if (result) {
          alert("Account Verified!");
        }
        // Update the state to remove the verified account from the pendingVerifications array
        setPendingVerifications((prevVerifications) =>
          prevVerifications.filter((verification) => verification.phoneNumber !== phoneNumber)
        );
      }
    } catch (error) {
      alert("Error approving verification", error);
    }
  };

  return (
    <div className="user-verification-container">
      <SidebarAdmin />
      <center><h2>Pending User Verifications</h2></center>
      <div className="user-verification">
        {pendingVerifications.length > 0 ? (
          <center><table className="user-verification-table">
          <thead>
            <tr>
              <th>USER ADDRESS</th>
              <th>PHONE NUMBER</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {pendingVerifications.map((verification, index) => (
              <tr key={index}>
                <td>{verification.userAddress}</td>
                <td>{verification.phoneNumber.toString()}</td>
                <td>
                  <button className="approve-submit" onClick={() => handleApproveClick(verification.phoneNumber)}>
                    Approve
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table></center>
        ) : (
          <p className="no-verifications-message">No pending user verifications!</p>
        )}
      </div>
    </div>
  );
};

export default UserVerification;
