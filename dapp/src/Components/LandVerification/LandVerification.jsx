import React, { useState, useEffect } from "react";
import Web3 from "web3";
import configuration from "../../LandRegistration.json"; // Replace with your contract ABI
import SidebarAdmin from "../SidebarAdmin/SidebarAdmin";
import "./LandVerification.css";

const contractABI = configuration.abi; // Replace with your contract ABI

const LandVerification = ({ landContractAddress }) => {
  const [pendingLandVerifications, setPendingLandVerifications] = useState([]);
  const [web3, setWeb3] = useState(null);
  const [landDetails, setLandDetails] = useState([]);

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
    // Function to fetch pending land verifications from the smart contract
    const fetchPendingLandVerifications = async () => {
      try {
        if (web3) {
          const contract = new web3.eth.Contract(contractABI, landContractAddress);

          // Call the getPendingLandVerificationRequests function on the contract
          const result = await contract.methods.getPendingLandVerificationRequests().call();
          setPendingLandVerifications(result);

          // Fetch additional details for each land
          const detailsPromises = result.map(async (landId) => {
            const landDetails = await contract.methods.landMapping(landId).call();
            return { landId, ...landDetails };
          });

          const details = await Promise.all(detailsPromises);
          setLandDetails(details);
        }
      } catch (error) {
        console.error("Error fetching pending land verifications:", error);
      }
    };

    // Call the fetchPendingLandVerifications function when the component mounts
    fetchPendingLandVerifications();
  }, [web3, landContractAddress]); // Update on web3 or landContractAddress changes

  // Function to handle the "Approve" button click
  const handleApproveClick = async (landId) => {
    try {
      if (web3) {
        const contract = new web3.eth.Contract(contractABI, landContractAddress);

        // Call the verifyLand function on the contract
        await contract.methods.verifyLand(landId).send({ from: (await web3.eth.getAccounts())[0] });

        // Update the state to remove the verified land from the pendingLandVerifications array
        setPendingLandVerifications((prevVerifications) =>
          prevVerifications.filter((verification) => verification !== landId)
        );
      }
    } catch (error) {
      console.error("Error approving land verification:", error);
    }
  };

  return (
    <div className="land-verification-container">
      <SidebarAdmin />
      <center><p className="land-verification-head">PENDING LAND VERIFICATIONS</p></center>
      <div className="land-verification">
        {pendingLandVerifications.length > 0 ? (
          <center><table className="land-verification-table">
            <thead>
              <tr>
                <th>LAND ID</th>
                <th>STATE</th>
                <th>DIVISION</th>
                <th>DISTRICT</th>
                <th>TALUKA</th>
                <th>VILLAGE</th>
                <th>SURVEY NUMBER</th>
                <th>SUBDIVISION</th>
                <th>AREA</th>
                <th>PURCHASE DATE</th>
                <th>PURCHASE PRICE</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {landDetails.map((landDetail, index) => (
                <tr key={index}>
                  <td>{landDetail.landId}</td>
                  <td>{landDetail.state}</td>
                  <td>{landDetail.division}</td>
                  <td>{landDetail.district}</td>
                  <td>{landDetail.taluka}</td>
                  <td>{landDetail.village}</td>
                  <td>{landDetail.surveyNumber}</td>
                  <td>{landDetail.subdivision}</td>
                  <td>{landDetail.area}</td>
                  <td>{landDetail.purchaseDate}</td>
                  <td>{landDetail.purchasePrice}</td>
                  <td>
                    <button className="approve-submit" onClick={() => handleApproveClick(landDetail.landId)}>
                      Approve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </center>
        ) : (
          <center><p className="no-verifications-message">No pending land verifications</p></center>
        )}
      </div>
    </div>
  );
};

export default LandVerification;
