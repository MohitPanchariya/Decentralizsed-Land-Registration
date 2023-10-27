let AccountRegistration = artifacts.require("AccountRegistration");
let landRegistration = artifacts.require("LandRegistration");

module.exports = async function (deployer) {
    //Deploy account registration contract
    await deployer.deploy(AccountRegistration);
    
    // Deploy land registration contract
    await deployer.deploy(landRegistration, AccountRegistration.address);

}