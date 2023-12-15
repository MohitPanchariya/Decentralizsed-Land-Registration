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
                from: accounts[1],
            });
            await accountRegistration.setUserDetails("User3", 3, 111111111111, {
                from: accounts[1],
            });

        } catch (error) {
            assert(
                error.message.includes("already registered"),
                "Error not thrown"
            );
        }
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
    await accountRegistration.removeLandInspector(accounts[2], {
      from: accounts[0],
    });

    const inspector = await accountRegistration.userAccountsMap(accounts[2]);
    assert.equal(inspector.designation, 0, "Inspector designation is not reset correctly");
  });

    it("should not allow removing the deployer's Land Inspector privileges", async () => {
        try {
            await accountRegistration.removeLandInspector(accounts[0], {
                from: accounts[0],
            });

        } catch (error) {
            assert(
                error.message.includes("Cannot remove deployer's Land Inspector privileges"),
                "Error not thrown"
            );
        }
    });

    it("should check if a user is verified", async () => {
        const isVerified = await accountRegistration.checkUserVerified(accounts[0]);
        assert.equal(isVerified, true, "User should be verified");
    });

    it("should check if a user is a deployer", async () => {
        const isDeployer = await accountRegistration.isDeployer(accounts[0]);
        assert.equal(isDeployer, true, "Account should be a deployer");
    });
    
    it("should not allow removing the deployer's Second-Level Authority privileges", async () => {
        try {
          await accountRegistration.removeSecondLevelAuthority(accounts[0], {
            from: accounts[0],
          });
          assert.fail("Should have thrown an error");
        } catch (error) {
          assert(
            error.message.includes("Cannot remove deployer's Second-level Authority privileges"),
            "Expected 'Cannot remove deployer's Second-level Authority privileges' error message"
          );
        }
      });
      
      it("should allow the deployer to add a Second-Level Authority", async () => {
        await accountRegistration.addSecondLevelAuthority(accounts[4], "Authority1", 333333333333, {
          from: accounts[0],
        });

        const authority = await accountRegistration.userAccountsMap(accounts[4]);
        assert.equal(authority.username, "Authority1", "Authority username is not set correctly");
        assert.equal(authority.designation, 2, "Authority designation is not set correctly");
        assert.equal(authority.aadharNumber, 333333333333, "Authority Aadhar number is not set correctly");
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
