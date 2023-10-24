pragma solidity ^0.8.0;

contract LandRegistrationSystem {
    address public deployer;
    
    struct UserAccount {
        string username;
        bool isLandInspector;
    }

    mapping(address => UserAccount) public userAccounts;
    
    constructor() {
        deployer = msg.sender;
        userAccounts[msg.sender] = UserAccount("Deployer", true);
    }

    modifier onlyDeployer() {
        require(msg.sender == deployer, "Only the deployer can perform this action");
        _;
    }

    modifier onlyLandInspector() {
        require(userAccounts[msg.sender].isLandInspector, "Only land inspectors can perform this action");
        _;
    }

    function addLandInspector(address _inspector, string memory _username) public onlyDeployer {
        userAccounts[_inspector] = UserAccount(_username, true);
    }

    function removeLandInspector(address _inspector) public onlyDeployer {
        require(_inspector != deployer, "Cannot remove deployer's privileges.");
        userAccounts[_inspector] = UserAccount("", false);
    }

    function isLandInspector(address _account) public view returns (bool) {
        return userAccounts[_account].isLandInspector;
    }
}