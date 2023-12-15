const { Web3 } = require("web3");
const fs = require("fs");

async function getAccounts(web3) {
  return await web3.eth.getAccounts();
}

/*
* Simulate accounts.length number of users trying to set their user details. 
* The requests are awaited in batches of 50. Numbers higher than this lead 
* to transactions failing on the local ganache blockchain, due to the transactions
* not being mined in a certain number of blocks.
*/
async function simulateRegistrationLoad(web3, contractAddress, contract, accounts) {
  let aadharNumber = 100000000000
  let promises = [];
  let promiseCount = 0;
  let rejectedCount = 0;

  const startTime = performance.now();

  for (const account of accounts) {
    const transaction = {
      to: contractAddress,
      data: contract.methods.setUserDetails(
        "test", 1, aadharNumber
      ).encodeABI(),
      from: account,
      gas: 800000
    }

    const promise = web3.eth.sendTransaction(transaction);
    promises.push(promise);
    aadharNumber += 1;

    if(promises.length >= 50) {
      const results = await Promise.allSettled(promises);
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

  console.log("Set user details time taken.")
  let results = await Promise.allSettled(promises);
    promiseCount += promises.length
    promises = []
    for(let result of results) {
        if(result.status == "rejected") {
            rejectedCount++;
            console.log(result)
        }
    }

  const endTime = performance.now();
  console.log((endTime - startTime) / 1000 + "s")

  console.log("Promise Count: " + promiseCount + ", Rejected Count: " + rejectedCount)
}

/*
* Simulate accounts.length number of users trying to request account verification. 
* The requests are awaited in batches of 50. Numbers higher than this lead 
* to transactions failing on the local ganache blockchain, due to the transactions
* not being mined in a certain number of blocks.
*/
async function simulateUserVerificationRequestLoad(
  web3, contractAddress, contract, accounts
) {
  let aadharNumber = 100000000000
  let promises = [];
  let promiseCount = 0;
  let rejectedCount = 0;

  const startTime = performance.now();

  for (const account of accounts) {
    const transaction = {
      to: contractAddress,
      data: contract.methods.requestVerification(
        aadharNumber
      ).encodeABI(),
      from: account,
    }

    const promise = web3.eth.sendTransaction(transaction);
    promises.push(promise);

    if(promises.length >= 50) {
      const results = await Promise.allSettled(promises);
      promiseCount += promises.length
      promises = []
      for(let result of results) {
        if(result.status == "rejected") {
          rejectedCount++;
          console.log(result)
        }
      }
    }

    aadharNumber += 1;
  }

  console.log("Request verification timestamps.")
  let results = await Promise.allSettled(promises);
    promiseCount += promises.length
    promises = []
    for(let result of results) {
        if(result.status == "rejected") {
            rejectedCount++;
            console.log(result)
        }
  }
  const endTime = performance.now();
  console.log((endTime - startTime) / 1000 + "s")

  console.log("Promise Count: " + promiseCount + ", Rejected Count: " + rejectedCount)
}

async function main() {
  //Read the abi and bytecode from the AccountRegistration.json file
  const { abi } = JSON.parse(fs.readFileSync("../build/contracts/AccountRegistration.json"));
  //Every time this script is executed, this contract address needs to be changed
  //to the new AccountRegistration contract address
  const contractAddress = "";

  const web3 = new Web3(new Web3.providers.HttpProvider("HTTP://127.0.0.1:8545"));

  const contract = new web3.eth.Contract(abi, contractAddress);
  
  const accounts = await getAccounts(web3);

  await simulateRegistrationLoad(web3, contractAddress, contract, accounts);
  
  await simulateUserVerificationRequestLoad(
    web3, contractAddress, contract, accounts
  );
}

main()