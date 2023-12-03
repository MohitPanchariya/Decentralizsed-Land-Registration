document.addEventListener('DOMContentLoaded', function () {
   
    const contractAddress = '0x3CE4DE73fFF52084CD1d05b813a5999065B5158A';
    const contractABI = YourContractABI;

    const web3 = new Web3(window.ethereum);

    // Use the contract ABI to create an instance of the smart contract
    const landRegistrationContract = new web3.eth.Contract(contractABI, contractAddress);

    async function addLandRecord() {
        const state = document.getElementById('state').value;
        const division = document.getElementById('division').value;
        const district = document.getElementById('district').value;
        const taluka = document.getElementById('taluka').value;
        const village = document.getElementById('village').value;
        const surveyNumber = document.getElementById('surveyNumber').value;
        const subdivision = document.getElementById('subdivision').value;
        const area = document.getElementById('area').value;
        const purchaseDate = new Date(document.getElementById('purchaseDate').value).getTime() / 1000; // Convert to UNIX timestamp
        const purchasePrice = document.getElementById('purchasePrice').value;
        const landValueAtPurchase = document.getElementById('landValueAtPurchase').value;

        try {
            const result = await landRegistrationContract.methods.addLandRecord(
                {
                    state,
                    division,
                    district,
                    taluka,
                    village,
                    surveyNumber,
                    subdivision,
                },
                area,
                purchaseDate,
                purchasePrice,
                landValueAtPurchase
            ).send({ from: await getAccount() });

            console.log('Transaction Result:', result);

            // Add logic to handle the transaction result
        } catch (error) {
            console.error('Error adding land record:', error);
            // Handle the error
        }
    }

    async function getAccount() {
        const accounts = await web3.eth.getAccounts();
        return accounts[0];
    }
});
