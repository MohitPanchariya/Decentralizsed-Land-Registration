pragma solidity ^0.8.0;

//contract Accounts
contract LandRegistrationSystem {
    address public deployer;
    

    struct UserAccount {
        string username;
        bool isVerified;
        uint256 authority; // 0: no authority, 1: land inspector: 2: second level authority
        
    }

    mapping(address => UserAccount) public userAccounts;
    mapping(uint256 => Land) public lands;
    
    constructor() {
        deployer = msg.sender;
        userAccounts[msg.sender] = UserAccount("Deployer", true);
    }

    modifier onlyDeployer() {
        require(msg.sender == deployer, "Only the deployer can perform this action");
    }

    modifier onlyLandInspector() {
        require(userAccounts[msg.sender].authority == 1, "Only land inspectors can perform this action");
    }

    function addLandInspector(address _inspector, string memory _username) public onlyDeployer {
        userAccounts[_inspector] = UserAccount(_username, true);
    }

    function removeLandInspector(address _inspector) public onlyDeployer {
        require(_inspector != deployer, "Cannot remove deployer's privileges.");
        userAccounts[_inspector] = UserAccount("", false);
    }

    function isLandInspector(address _account) public view returns (bool) {
        return userAccounts[_account].authority == 1;
    }

    function verifyAccount(uint256 _aadharNumber, string panNumber) public {
        //Make sure aadhar is valid, pan is valid. Try to search online how this can be done.
        //Make sure no person can register twice, i.e no two different addresses should have same
        //aadhar or pan number.
    }
    
    /*
        Returns a boolean for whether the account is verified.
    */
    function isVerified(address _account) public view returns(bool){
        return userAccounts[_account].isVerified;
    }
    
    /*
        Allowing first and second level authorities to grant inspector status to an account.
    */
    function grantLandInspectorStatus(address _account) public {
        if (userAccounts[msg.sender].authority == 1 || userAccounts[msg.sender].authority == 2)
            userAccounts[_account].authority = 1;
    }
}
