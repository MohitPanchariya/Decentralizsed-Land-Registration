import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AddLand.css";
import Web3 from "web3";
import configuration from "../../LandRegistration.json";
import Sidebar from "../Sidebar/Sidebar";

const landContractAddress = "0x030722FDC11E466544368d96fDEa6CD31411c282";
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
        console.log(account)

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
                subdivision: subdivision
            },
            area: area,
            purchaseDate: purchaseDate,
            purchasePrice: purchasePrice,
            landValueAtPurchase: landValueAtPurchase,
            previousOwners: [],
            //These values are not used by the function but are required
            isVerified: false,
            isForSale: false
        }

        const web3Instance = new Web3(window.ethereum);

        const contract = new web3Instance.eth.Contract(
          contractABI,
          landContractAddress
        );

        try {
            const transaction = await contract.methods.addLandRecord(landRecord).send(
                {from: account}
            );
            const transactionEvents = transaction.events;
            if(transactionEvents.LandRecordExists) {
                alert("Land Record already exists.")
            } else if(transactionEvents.LandRecordAdded) {
                alert("Land Record added!")
            }
            console.log(transaction.events)
        } catch (error) {
            console.error(error)
            alert("Transaction failed.")
        }
  };

    return <>
        <Sidebar />
        <div>
        <h1>Land Registration Form</h1>
        <form onSubmit={handleSubmit}>
            <label>
            State:
            <input type="text" value={state} onChange={(e) => setState(e.target.value)} required/>
            </label>
            <br />
            <label>
            Division:
            <input type="text" value={division} onChange={(e) => setDivision(e.target.value)} required/>
            </label>
            <br />
            <label>
            District:
            <input type="text" value={district} onChange={(e) => setDistrict(e.target.value)} required/>
            </label>
            <br />
            <label>
            Taluka:
            <input type="text" value={taluka} onChange={(e) => setTaluka(e.target.value)} required/>
            </label>
            <br />
            <label>
            Village:
            <input type="text" value={village} onChange={(e) => setVillage(e.target.value)} required/>
            </label>
            <br />
            <label>
            Survey Number:
            <input type="number" value={surveyNumber} onChange={(e) => setSurveyNumber(parseInt(e.target.value, 10))} required/>
            </label>
            <br />
            <label>
            Subdivision:
            <input type="text" value={subdivision} onChange={(e) => setSubdivision(e.target.value)} required/>
            </label>
            <br />
            <label>
            Area:
            <input type="number" value={area} onChange={(e) => setArea(parseInt(e.target.value, 10))} required/>
            </label>
            <br />
            <label>
            Purchase Date:
            <input type="number" value={purchaseDate} onChange={(e) => setPurchaseDate(parseInt(e.target.value, 10))} required/>
            </label>
            <br />
            <label>
            Purchase Price:
            <input type="number" value={purchasePrice} onChange={(e) => setPurchasePrice(parseInt(e.target.value, 10))} required/>
            </label>
            <br />
            <label>
            Land Value at Purchase:
            <input type="number" value={landValueAtPurchase} onChange={(e) => setLandValueAtPurchase(parseInt(e.target.value, 10))} required/>
            </label>
            <br />
            <button type="submit">Submit</button>
        </form>
        </div>
    </>
};

export default AddLandRecord;
