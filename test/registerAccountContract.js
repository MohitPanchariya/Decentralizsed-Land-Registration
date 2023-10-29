const AccountRegistration = artifacts.require("AccountRegistration");

contract("AccountRegistration", (accounts) => {
    let accountRegistration;

    before(async () => {
        accountRegistration = await AccountRegistration.deployed();
    });

    it("should set deployer correctly in the constructor", async () => {
        const deployer = await accountRegistration.deployer();
        assert.equal(deployer, accounts[0], "Deployer is not set correctly");
    });

    it("should not allow setting user details more than once", async () => {
        try {
            await accountRegistration.setUserDetails("User3", 3, 111111111111, {
                from: accounts[0],
            });

        } catch (error) {
            assert(
                error.message.includes("User details can only be set once"),
                "Error not thrown"
            );
        }
    });

    it("should allow adding a Land Inspector by deployer or second-level authority", async () => {
        await accountRegistration.addLandInspector(accounts[1], "Inspector1", 222222222223, {
            from: accounts[0],
        });

        const inspector = await accountRegistration.userAccounts(accounts[1]);
        assert.equal(inspector.username, "Inspector1", "Inspector username is not set correctly");
        assert.equal(inspector.designation, 1, "Inspector designation is not set correctly");
        assert.equal(inspector.aadharNumber, 222222222223, "Inspector Aadhar number is not set correctly");
    });

    it("should not allow adding a Land Inspector with an existing Aadhar number", async () => {
        try {
            await accountRegistration.addLandInspector(accounts[2], "Inspector2", 222222222223, {
                from: accounts[0],
            });

        } catch (error) {
            assert(
                error.message.includes("Aadhar number already registered."),
                "Error not thrown"
            );
        }
    });

    it("should not allow non-deployer or non-second-level authority to add a Land Inspector", async () => {
        try {
            await accountRegistration.addLandInspector(accounts[3], "Inspector3", 333333333333, {
                from: accounts[1],
            });

        } catch (error) {
            assert(
                error.message.includes("Only the deployer or second-level authority can perform this action"),
                "Error not thrown"
            );
        }
    });

    it("should allow adding a Second-Level Authority by deployer", async () => {
        await accountRegistration.addSecondLevelAuthority(accounts[4], "Authority1", 444444444444, {
            from: accounts[0],
        });

        const authority = await accountRegistration.userAccounts(accounts[4]);
        assert.equal(authority.username, "Authority1", "Authority username is not set correctly");
        assert.equal(authority.designation, 2, "Authority designation is not set correctly");
        assert.equal(authority.aadharNumber, 444444444444, "Authority Aadhar number is not set correctly");
    });

    it("should not allow adding a Second-Level Authority with an existing Aadhar number", async () => {
        try {
            await accountRegistration.addSecondLevelAuthority(accounts[5], "Authority2", 444444444444, {
                from: accounts[0],
            });

        } catch (error) {
            assert(
                error.message.includes("Aadhar number already registered."),
                "Error not thrown"
            );
        }
    });

    it("should not allow non-deployer to add a Second-Level Authority", async () => {
        try {
            await accountRegistration.addSecondLevelAuthority(accounts[6], "Authority3", 555555555555, {
                from: accounts[1],
            });

        } catch (error) {
            assert(
                error.message.includes("Only the deployer can perform this action"),
                "Error not thrown"
            );
        }
    });

    it("should allow removing a Second-Level Authority by deployer", async () => {
        await accountRegistration.removeSecondLevelAuthority(accounts[4], {
            from: accounts[0],
        });

        const authority = await accountRegistration.userAccounts(accounts[4]);
        assert.equal(authority.designation, 0, "Authority designation is not reset correctly");
    });

    it("should not allow removing the deployer's Second-Level Authority privileges", async () => {
        try {
            await accountRegistration.removeSecondLevelAuthority(accounts[0], {
                from: accounts[0],
            });

        } catch (error) {
            assert(
                error.message.includes("Cannot remove deployer's Second-level Authority privileges."),
                "Error not thrown"
            );
        }
    });

    it("should allow removing a Land Inspector by deployer or second-level authority", async () => {
        await accountRegistration.addLandInspector(accounts[1], "Inspector1", 666666666666, {
            from: accounts[0],
        });

        await accountRegistration.removeLandInspector(accounts[1], {
            from: accounts[0],
        });

        const inspector = await accountRegistration.userAccounts(accounts[1]);
        assert.equal(inspector.designation, 0, "Inspector designation is not reset correctly");
    });

    it("should not allow removing the deployer's privileges", async () => {
        try {
            await accountRegistration.removeLandInspector(accounts[0], {
                from: accounts[0],
            });

        } catch (error) {
            assert(
                error.message.includes("Cannot remove deployer's privileges."),
                "Error not thrown"
            );
        }
    });

    it("should check if a user is verified", async () => {
        const isVerified = await accountRegistration.isUserVerified(accounts[0]);
        assert.equal(isVerified, true, "User should be verified");
    });

    it("should check if a user is a deployer", async () => {
        const isDeployer = await accountRegistration.isDeployer(accounts[0]);
        assert.equal(isDeployer, true, "Account should be a deployer");
    });

    it("should not allow non-deployer or non-second-level authority to grant Land Inspector status", async () => {
        try {
            await accountRegistration.grantLandInspectorStatus(accounts[3], {
                from: accounts[2],
            });

        } catch (error) {
            assert(
                error.message.includes("Only the deployer or second-level authority can perform this action"),
                "Error not thrown"
            );
        }
    });

    it("should grant Second-Level Authority status by deployer", async () => {
        await accountRegistration.grantSecondLevelAuthorityStatus(accounts[1], {
            from: accounts[0],
        });

        const authority = await accountRegistration.userAccounts(accounts[1]);
        assert.equal(authority.designation, 2, "Authority designation is not set correctly");

        await accountRegistration.grantSecondLevelAuthorityStatus(accounts[2], {
            from: accounts[0],
        });

        const authority2 = await accountRegistration.userAccounts(accounts[2]);
        assert.equal(authority2.designation, 2, "Authority designation is not set correctly");
    });

    it("should not allow non-deployer to grant Second-Level Authority status", async () => {
        try {
            await accountRegistration.grantSecondLevelAuthorityStatus(accounts[3], {
                from: accounts[1],
            });

        } catch (error) {
            assert(
                error.message.includes("Only the deployer can perform this action"),
                "Error not thrown"
            );
        }
    });
});

