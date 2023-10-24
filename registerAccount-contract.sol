pragma solidity ^0.8.0;

contract LandRegistrationSystem {
    address public deployer;

    struct UserAccount {
        string username;
        bool isVerified;
        uint8 designation; // 0: no authority, 1: land inspector, 2: second-level authority, 3: deployer
        uint registrationDate; // Registration date as a Unix timestamp
    }

    mapping(address => UserAccount) public userAccounts;

    constructor() {
        deployer = msg.sender;
        userAccounts[msg.sender] = UserAccount("Deployer", true, 3, block.timestamp); 
    }

    modifier onlyDeployer() {
        require(userAccounts[msg.sender].designation == 3, "Only the deployer can perform this action");
        _;
    }

    modifier onlyDeployerOrSecondLevelAuthority() {
        require(userAccounts[msg.sender].designation >= 2, "Only the deployer or second-level authority can perform this action");
        _;
    }

    modifier onlyDeployerOrSecondLevelAuthorityOrLandInspector() {
        require(userAccounts[msg.sender].designation >= 1, "Only the deployer, second level authority, or land inspector can perform this action");
        _;
    }

    function addLandInspector(address _inspector, string memory _username) public onlyDeployerOrSecondLevelAuthority {
        userAccounts[_inspector] = UserAccount(_username, true, 1, block.timestamp);
    }

    function addSecondLevelAuthority(address _authority, string memory _username) public onlyDeployer {
        userAccounts[_authority] = UserAccount(_username, true, 2, block.timestamp);
    }

    function removeSecondLevelAuthority(address _authority) public onlyDeployer {
        require(_authority != deployer, "Cannot remove deployer's Second-level Authority privileges.");
        userAccounts[_authority] = UserAccount("", false, 0, block.timestamp);
    }

    function removeLandInspector(address _inspector) public onlyDeployerOrSecondLevelAuthority {
        require(_inspector != deployer , "Cannot remove deployer's privileges.");
        userAccounts[_inspector] = UserAccount("", false, 0, block.timestamp);
    }

    function verifyAccount(uint256 _aadharNumber, string memory _panNumber) public onlyDeployerOrSecondLevelAuthorityOrLandInspector {
        // Add logic to verify the account here.
    }

    function isVerified(address _account) public view returns (bool) {
        return userAccounts[_account].isVerified;
    }

    function grantLandInspectorStatus(address _account) public onlyDeployerOrSecondLevelAuthority {
        userAccounts[_account].designation = 1;
    }

    function grantSecondLevelAuthorityStatus(address _account) public onlyDeployer {
        userAccounts[_account].designation = 2;
    }
}
