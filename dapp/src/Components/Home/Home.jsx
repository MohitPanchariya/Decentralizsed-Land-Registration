import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import configuration from "../../LandRegistration.json";
import Web3 from "web3";
import "./home.css";
import Sidebar from "../Sidebar/Sidebar";

const landContractAddress = "0x76017b4E9Fe30D5b2Ba7D345B8a42aC2b85C7978";
const contractABI = configuration.abi;

//Returns jsx which will display all lands owned by the user
function Home() {
  const [myLands, setMyLands] = useState([]);

  const getMetamaskAccount = async () => {
    // Request MetaMask account access
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    return accounts[0];
  };

  const initPage = async () => {
    if (window.ethereum) {
      try {
        const account = await getMetamaskAccount();
        await fetchMyLands(account);
      } catch (error) {
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

  const fetchMyLands = async (account) => {
    // Create a Web3 instance using the provider from MetaMask
    const web3Instance = new Web3(window.ethereum);

    // Connect to your contract using the Web3 instance
    const contract = new web3Instance.eth.Contract(
      contractABI,
      landContractAddress
    );

    const gas = 2000000;
    // Call the getMyLands function on the contract
    const result = await contract.methods
      .getMyLands()
      .call({ from: account, gas });
    setMyLands(result);
    console.log(result);
  };

  const listLandForSale = async (landId) => {
    const account = await getMetamaskAccount();

    console.log("listLandForSale called: " + landId.toString());
    const web3Instance = new Web3(window.ethereum);

    const contract = new web3Instance.eth.Contract(
      contractABI,
      landContractAddress
    );
    try {
      const transaction = await contract.methods
        .listLandForSale(landId)
        .send({ from: account });
      const transactionEvents = transaction.events;
      if (transactionEvents.LandListedForSale) {
        alert("Land listed for sale.");
      } else {
        console.error("No event emitted.");
        alert("No event emitted.");
      }
      console.log(transaction.events);
    } catch (error) {
      console.error(error);
      alert("Transaction failed.");
    }
  };

  useEffect(() => {
    initPage();
  }, []);

  return (
    <>
      <Sidebar />
      <div className="card-container">
        {myLands.map((land, index) => (
          <div className="card" key={index}>
            <h3>Land {index + 1}</h3>
            <p>Land Id: {land.landId.toString()}</p>
            {/* Land Owner Address */}
            <p>Land Owner Address: {land.owner}</p>
            <p>State: {land.identifier.state}</p>
            <p>Division: {land.identifier.division}</p>
            <p>District: {land.identifier.district}</p>
            <p>Taluka: {land.identifier.taluka}</p>
            <p>Village: {land.identifier.village}</p>
            <p>Survery Number: {land.identifier.surveyNumber.toString()}</p>
            <p>Subdivision: {land.identifier.subdivision}</p>
            <p>Area: {land.area.toString()}</p>
            <p>Purchase Date: {land.purchaseDate.toString()}</p>
            <p>Purchase Price: {land.purchasePrice.toString()}</p>
            <p>Land Value at Purchase: {land.landValueAtPurchase.toString()}</p>
            <p>Land Verified: {land.isVerified.toString()}</p>
            <p>Land for sale: {land.isForSale.toString()}</p>
            <button
              onClick={() => {
                listLandForSale(land.landId);
              }}
            >
              List Land for Sale
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

export default Home;
