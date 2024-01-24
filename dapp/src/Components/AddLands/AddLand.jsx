import React, { useState } from "react";
import Web3 from "web3";
import configuration from "../../LandRegistration.json";
import Sidebar from "../Sidebar/Sidebar";
import "./AddLand.css";

const landContractAddress = "0xD4e46d45EAF564eb89C58e09D0A947dCd2e45008";
const contractABI = configuration.abi;

export const AddLandRecord = () => {
  // State variables to hold form data
  const [state, setState] = useState("");
  const [division, setDivision] = useState("");
  const [district, setDistrict] = useState("");
  const [taluka, setTaluka] = useState("");
  const [village, setVillage] = useState("");
  const [surveyNumber, setSurveyNumber] = useState(0);
  const [subdivision, setSubdivision] = useState("");
  const [area, setArea] = useState(0);
  const [purchaseDate, setPurchaseDate] = useState(0);
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [landValueAtPurchase, setLandValueAtPurchase] = useState(0);

  // Function to handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Request MetaMask account access
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const account = accounts[0];
    console.log(account);

    const landRecord = {
      // This is just a dummy value, the smart contract's
      // function requires it, but ignores the value
      landId: 0,
      owner: account,
      identifier: {
        state: state,
        division: division,
        district: district,
        taluka: taluka,
        village: village,
        surveyNumber: surveyNumber,
        subdivision: subdivision,
      },
      area: area,
      purchaseDate: purchaseDate,
      purchasePrice: purchasePrice,
      landValueAtPurchase: landValueAtPurchase,
      previousOwners: [],
      //These values are not used by the function but are required
      isVerified: false,
      isForSale: false,
    };

    const web3Instance = new Web3(window.ethereum);

    const contract = new web3Instance.eth.Contract(
      contractABI,
      landContractAddress
    );

    try {
      const transaction = await contract.methods
        .addLandRecord(landRecord)
        .send({ from: account });
      const transactionEvents = transaction.events;
      if (transactionEvents.LandRecordExists) {
        alert("Land Record already exists.");
      } else if (transactionEvents.LandRecordAdded) {
        alert("Land Record added!");
      }
      console.log(transaction.events);
    } catch (error) {
      console.error(error);
      alert("Transaction failed.");
    }
  };

  return (
    <>
      <div>
        <Sidebar />
        <center>
          <h2>Land Registration Form</h2>
        </center>
        <form onSubmit={handleSubmit}>
          <input
            name="STATE"
            class="feedback-input"
            placeholder="STATE"
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            required
          />
          <input
            name="DIVISION"
            class="feedback-input"
            placeholder="DIVISION"
            type="text"
            value={division}
            onChange={(e) => setDivision(e.target.value)}
            required
          />
          <input
            placeholder="DISTRICT"
            class="feedback-input"
            type="text"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            required
          />
          <input
            placeholder="TALUKA"
            class="feedback-input"
            type="text"
            value={taluka}
            onChange={(e) => setTaluka(e.target.value)}
            required
          />
          <input
            placeholder="VILLAGE"
            class="feedback-input"
            type="text"
            value={village}
            onChange={(e) => setVillage(e.target.value)}
            required
          />
          <input
            placeholder="SURVEY NUMBER"
            class="feedback-input"
            type="number"
            value={surveyNumber === 0 ? "" : surveyNumber}
            onChange={(e) => setSurveyNumber(parseInt(e.target.value, 10))}
            required
          />
          <input
            placeholder="SUBDIVISION"
            class="feedback-input"
            type="text"
            value={subdivision}
            onChange={(e) => setSubdivision(e.target.value)}
            required
          />
          <input
            placeholder="AREA"
            className="feedback-input"
            type="number"
            value={area === 0 ? "" : area}
            onChange={(e) => setArea(parseInt(e.target.value, 10))}
            required
          />
          <input
            placeholder="PURCHASE DATE"
            className="feedback-input"
            type="number"
            value={purchaseDate === 0 ? "" : purchaseDate}
            onChange={(e) => setPurchaseDate(parseInt(e.target.value, 10))}
            required
          />
          <input
            placeholder="PURCHASE PRICE"
            className="feedback-input"
            type="number"
            value={purchasePrice === 0 ? "" : purchasePrice}
            onChange={(e) => setPurchasePrice(parseInt(e.target.value, 10))}
            required
          />
          <input
            placeholder="LAND VALUE AT PURCHASE"
            className="feedback-input"
            type="number"
            value={landValueAtPurchase === 0 ? "" : landValueAtPurchase}
            onChange={(e) =>
              setLandValueAtPurchase(parseInt(e.target.value, 10))
            }
            required
          />
          <button type="submit">SUBMIT</button>
        </form>
      </div>
    </>
  );
};

export default AddLandRecord;
