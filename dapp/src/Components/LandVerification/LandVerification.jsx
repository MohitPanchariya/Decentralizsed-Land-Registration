import React, { useState, useEffect } from "react";
import Web3 from "web3";
import configuration from "../../LandRegistration.json";
import SidebarAdmin from "../SidebarAdmin/SidebarAdmin";
import "./LandVerification.css";

const contractABI = configuration.abi;

const LandVerification = ({ landContractAddress }) => {
  const [pendingLandVerifications, setPendingLandVerifications] = useState([]);
  const [web3, setWeb3] = useState([]);
  const [landDetailsList, setLandDetailsList] = useState([]);

  useEffect(() => {
    const initializeWeb3 = async () => {
      if (window.ethereum) {
        try {
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

    const fetchData = async () => {
      try {
        if (web3 && landContractAddress) {
          const contract = new web3.eth.Contract(contractABI, landContractAddress);

          // Fetch pending land verifications
          const result = await contract.methods.getPendingLandVerificationRequests().call();
          setPendingLandVerifications(result);

          // Fetch details for each landID in the pendingLandVerifications array
          const detailsPromises = result.map(async (landId) => {
            const landDetails = await contract.methods.landMapping(landId).call();
            console.log(landDetails);
            return { landId, ...landDetails };
          });

          // Wait for all details to be fetched
          const allLandDetails = await Promise.all(detailsPromises);
          setLandDetailsList(allLandDetails);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    initializeWeb3();
    fetchData();
  }, []); // Empty dependency array ensures the effect runs only once

  const handleApproveClick = async (landId) => {
    try {
      if (web3) {
        const contract = new web3.eth.Contract(contractABI, landContractAddress);
        await contract.methods.verifyLand(landId).send({ from: (await web3.eth.getAccounts())[0] });
        setPendingLandVerifications((prevVerifications) =>
          prevVerifications.filter((verification) => verification !== landId)
        );

        // Fetch details for the approved land directly from landMapping
        const approvedLandDetails = await contract.methods.landMapping(landId).call();
        setLandDetailsList((prevDetailsList) => [...prevDetailsList, { landId, ...approvedLandDetails }]);
      }
    } catch (error) {
      console.error("Error approving land verification:", error);
    }
  };

  return (
    <div className="land-verification-container">
      <SidebarAdmin />
      <p className="land-verification-head">PENDING LAND VERIFICATIONS</p>
      <div className="land-verification">
        {landDetailsList.length > 0 ? (
          <center>
            <table className="land-verification-table">
              <thead>
                <tr>
                  <th>LAND ID</th>
                  <th>OWNER'S ADDRESS</th>
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
                  <th>LANDVALUE AT PURCHASE</th>
                  {/* Add more headers for other details */}
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {landDetailsList.map((landDetails, index) => (
                  <tr key={index}>
                    <td>{landDetails.landId.toString()}</td>
                    <td>{landDetails.owner}</td>
                    <td>{landDetails.identifier.state}</td>
                    <td>{landDetails.identifier.division}</td>
                    <td>{landDetails.identifier.district}</td>
                    <td>{landDetails.identifier.taluka}</td>
                    <td>{landDetails.identifier.village}</td>
                    <td>{landDetails.identifier.surveyNumber.toString()}</td>
                    <td>{landDetails.identifier.subdivision}</td>
                    <td>{landDetails.area.toString()}</td>
                    <td>{landDetails.purchaseDate.toString()}</td>
                    <td>{landDetails.purchasePrice.toString()}</td>
                    <td>{landDetails.landValueAtPurchase.toString()}</td>
                    <td>
                      <button className="approve-submit" onClick={() => handleApproveClick(landDetails.landId)}>
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
