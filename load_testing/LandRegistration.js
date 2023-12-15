const { Web3 } = require("web3");
const fs = require("fs");

async function getAccounts(web3) {
  return await web3.eth.getAccounts();
}

async function simulateLandRegistration(
    web3, contractAddress, contract, accounts
) {
    let promises = [];
    let promiseCount = 0;
    let rejectedCount = 0;

    let landRecordParameter = {
        landId: 123,
        owner: 0x00, 
        identifier: {
          state: "test",
          divison: "test",
          district: "test",
          taluka: "test",
          village: "test",
          surveyNumber: 111,
          subdivision: "test",
        },
        area: 789,
        purchaseDate: 1639459200, // UNIX timestamp for a specific date, replace with the actual timestamp
        purchasePrice: 100000,
        landValueAtPurchase: 120000,
        previousOwners: [], // replace with actual addresses
        isVerified: false,
        isForSale: false,
    };

    const startTime = performance.now()
    for(let i = 1; i < accounts.length; i++) {
        landRecordParameter.owner = accounts[i];
        landRecordParameter.identifier.surveyNumber += 1;
    
        const transaction = {
            to: contractAddress,
            data: contract.methods.addLandRecord(
                landRecordParameter
            ).encodeABI(),
            from: accounts[i]
        }
    
        const promise = web3.eth.sendTransaction(transaction);
        promises.push(promise);
    
        if(promises.length >= 50) {
            let results = await Promise.allSettled(promises);
            promiseCount += promises.length
            promises = []
            for(let result of results) {
                if(result.status == "rejected") {
                    rejectedCount++;
                    console.log(result)
                }
            }
        }
    }

    let results = await Promise.allSettled(promises);
    promiseCount += promises.length
    promises = []
    for(let result of results) {
        if(result.status == "rejected") {
            rejectedCount++;
            console.log(result)
        }
    }

    console.log("Add Land Records time taken.")

  const endTime = performance.now();
  console.log((endTime - startTime) / 1000 + "s")

  console.log("Promise Count: " + promiseCount + ", Rejected Count: " + rejectedCount)
}

async function simulateLandVerification(
    web3, contractAddress, contract, accounts
) {
    let promises = [];
    let promiseCount = 0;
    let rejectedCount = 0;

    let identifier = {
        state: "test",
        divison: "test",
        district: "test",
        taluka: "test",
        village: "test",
        surveyNumber: 111,
        subdivision: "test",
    };

    const startTime = performance.now()
    for(let i = 1; i < accounts.length; i++) {
        identifier.surveyNumber += 1;
    
        const landId = await contract.methods.getLandId(identifier).call();

        const transaction = {
            to: contractAddress,
            data: contract.methods.landVerificationRequest(
                landId
            ).encodeABI(),
            from: accounts[i]
        }
    
        const promise = web3.eth.sendTransaction(transaction);
        promises.push(promise);
    
        if(promises.length >= 50) {
            let results = await Promise.allSettled(promises);
            promiseCount += promises.length
            promises = []
            for(let result of results) {
                if(result.status == "rejected") {
                    rejectedCount++;
                    console.log(result)
                }
            }
        }
    }

    let results = await Promise.allSettled(promises);
    promiseCount += promises.length
    promises = []
    for(let result of results) {
        if(result.status == "rejected") {
            rejectedCount++;
            console.log(result)
        }
    }

    console.log("Request Land Verification time taken.")

  const endTime = performance.now();
  console.log((endTime - startTime) / 1000 + "s")

  console.log("Promise Count: " + promiseCount + ", Rejected Count: " + rejectedCount)
}

async function main() {
  const landABI = JSON.parse(fs.readFileSync("../build/contracts/LandRegistration.json")).abi;

  const landContractAddress = "";

  //Connect to the local blockchain
  const web3 = new Web3(new Web3.providers.HttpProvider("HTTP://127.0.0.1:8545"));

  const landContract = new web3.eth.Contract(landABI, landContractAddress);
  
  const accounts = await getAccounts(web3);
  
  await simulateLandRegistration(web3, landContractAddress, landContract, accounts);

  await simulateLandVerification(web3, landContractAddress, landContract, accounts);
}

main()