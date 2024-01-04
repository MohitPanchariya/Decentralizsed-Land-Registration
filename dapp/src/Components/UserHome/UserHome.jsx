// Import necessary libraries
import React from "react";
import Web3 from "web3"; // Import web3 library
import configuration from "../../AccountRegistration.json";
import "./UserHome.css";

const UserHome = ({ userDetails }) => {
  // Convert Unix timestamp to human-readable date
  const registrationDate = new Date(
    Number(userDetails.registrationDate) * 1000
  );

  const handleRequestVerification = async () => {
    try {
      // Connect to the user's web3 provider
      const web3 = new Web3(window.ethereum);

      // Get the user's accounts
      const accounts = await web3.eth.getAccounts();

      // Replace 'YourContractAddress' and 'YourContractABI' with the actual contract address and ABI
      const contractAddress = "0xd8c70667BA1b56547069A605Da1EdFDC3c4054C7";
      const contractABI = configuration.abi;

      // Create a contract instance
      const contract = new web3.eth.Contract(contractABI, contractAddress);

      // Call the requestVerification function
      await contract.methods
        .requestVerification(userDetails.aadharNumber)
        .send({
          from: accounts[0], // Assuming the user is using the first account
        });

      console.log("Verification request sent successfully!");
      // Add any additional logic or UI updates as needed
    } catch (error) {
      console.error("Error sending verification request:", error);
      // Handle errors or display an error message to the user
    }
  };

  return (
    <div class="userhome">
      <h1>Welcome {userDetails.username}</h1>
      <p>Username: {userDetails.username}</p>
      <p>User Address: {userDetails.userAddress}</p>
      <p>Aadhar Number: {String(userDetails.aadharNumber)}</p>
      <p>User Verified: {String(userDetails.isUserVerified)}</p>
      <p>Designation: {String(userDetails.designation)}</p>
      <p>Registration Date: {registrationDate.toLocaleString()}</p>

      {!userDetails.isUserVerified && (
        <button onClick={handleRequestVerification}>
          Request Verification
        </button>
      )}
    </div>
  );
};

export default UserHome;
