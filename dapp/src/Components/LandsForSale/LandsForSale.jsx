import React, { useEffect, useState } from "react";
import configuration from "../../LandRegistration.json";
import Web3 from "web3";
import Sidebar from "../Sidebar/Sidebar";

const landContractAddress = "0x94652AF41E2747234F279aa0E3b6E63Ba95376E5";
const contractABI = configuration.abi;

//Returns jsx which will display all lands owned by the user
function LandsForSale() {
  const [landsForSale, setLandsForSale] = useState([]);

  const getMetamaskAccount = async () => {
    // Request MetaMask account access
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    console.log(accounts[0]);
    return accounts[0];
  };

  const fetchLandsForSale = async (account) => {
    // Create a Web3 instance using the provider from MetaMask
    const web3Instance = new Web3(window.ethereum);

    // Connect to your contract using the Web3 instance
    const contract = new web3Instance.eth.Contract(
      contractABI,
      landContractAddress
    );

    const gas = 2000000;
    // Call the getLandsForSale function on the contract
    const result = await contract.methods
      .getLandsForSale()
      .call({ from: account, gas });
    console.log(result);
    return result;
  };

  const initPage = async () => {
    if (window.ethereum) {
      try {
        const account = await getMetamaskAccount();
        console.log(account);
        const result = await fetchLandsForSale(account);
        setLandsForSale(result);
      } catch (error) {
        console.error(error);
        console.error("Error connecting to Metamask:", error);
      }
    } else {
      if (!window.ethereum) {
        console.error("Metamask not detected");
      } else {
        console.log("Already connected to metamask");
      }
    }
  };

  useEffect(() => {
    initPage();
  }, []);

  return (
    <>
      <Sidebar />
      <div className="card-container">
        {landsForSale.map((land, index) => (
          <div className="card" key={index}>
            <center>
              <h3>LAND {index + 1}</h3>
            </center>
            <p className="land-details">
              <b>Land Id: </b>
              {land.landId.toString()}
            </p>
            {/* Land Owner Address */}
            <p className="land-details">
              <b>Land Owner Address: </b>
              {land.owner}
            </p>
            <p className="land-details">
              <b>State: </b>
              {land.identifier.state}
            </p>
            <p className="land-details">
              <b>Division: </b>
              {land.identifier.division}
            </p>
            <p className="land-details">
              <b>District: </b>
              {land.identifier.district}
            </p>
            <p className="land-details">
              <b>Taluka: </b>
              {land.identifier.taluka}
            </p>
            <p className="land-details">
              <b>Village: </b>
              {land.identifier.village}
            </p>
            <p className="land-details">
              <b>Survery Number: </b>
              {land.identifier.surveyNumber.toString()}
            </p>
            <p className="land-details">
              <b>Subdivision: </b>
              {land.identifier.subdivision}
            </p>
            <p className="land-details">
              <b>Area: </b>
              {land.area.toString()}
            </p>
            <p className="land-details">
              <b>Purchase Date: </b>
              {land.purchaseDate.toString()}
            </p>
            <p className="land-details">
              <b>Purchase Price: </b>
              {land.purchasePrice.toString()}
            </p>
            <p className="land-details">
              <b>Land Value at Purchase: </b>
              {land.landValueAtPurchase.toString()}
            </p>
            <p className="land-details">
              <b>Land Verified: </b>
              {land.isVerified.toString()}
            </p>
            <p className="land-details">
              <b>Land for sale: </b>
              {land.isForSale.toString()}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}

export default LandsForSale;
