import React, { useEffect, useState } from "react";
import configuration from "../../LandRegistration.json"
import Web3 from "web3";
import "./LandsForSale.css"
import Sidebar from "../Sidebar/Sidebar"

const landContractAddress = "0x030722FDC11E466544368d96fDEa6CD31411c282";
const contractABI = configuration.abi;

//Returns jsx which will display all lands owned by the user
function LandsForSale() {
    const [landsForSale, setLandsForSale] = useState([]);

    const getMetamaskAccount = async() => {
        // Request MetaMask account access
        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
        });
        console.log(accounts[0]);
        return accounts[0];
    }

    const fetchLandsForSale = async (account)=> {
        // Create a Web3 instance using the provider from MetaMask
        const web3Instance = new Web3(window.ethereum);

        // Connect to your contract using the Web3 instance
        const contract = new web3Instance.eth.Contract(
            contractABI,
            landContractAddress
        );

        const gas = 2000000; 
        // Call the getLandsForSale function on the contract
        const result = await contract.methods.getLandsForSale().call(
            {from: account, gas}
        );
        console.log(result);
        return result;
    }

    const initPage = async () => {
        if (window.ethereum) {
          try {
            const account = await getMetamaskAccount();
            console.log(account)
            const result = await fetchLandsForSale(account);
            setLandsForSale(result);
        } catch (error) {
                console.error(error)
                console.error('Error connecting to Metamask:', error);
            }
        } else {
          if(!window.ethereum) {
            console.error("Metamask not detected")
          } else {
            console.log("Already connected to metamask")
          }
        }
    };

    useEffect(() => {
        initPage();
    }, [])

    return <>
        <Sidebar />
        <div className="card-container">
            { landsForSale.map((land, index) => (
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
            </div>
            )) }
        </div>
    </>
}

export default LandsForSale;