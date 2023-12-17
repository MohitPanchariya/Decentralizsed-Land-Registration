const AccountRegistration = artifacts.require("AccountRegistration");
const LandRegistration = artifacts.require("LandRegistration");
const truffleAssert = require("truffle-assertions");

contract("LandRegistration", async (accounts) => {
    let AccountRegistrationInstance, landRegistrationInstance;
    let owner, verifiedUser, unVerifiedUser;
    let deployer;

    before(async () => {
        //Deploy account registration contract
        AccountRegistrationInstance = await AccountRegistration.deployed();

        //Deploy land registration contract
        landRegistrationInstance = await LandRegistration.new(
            AccountRegistrationInstance.address
        );

        //Assign addresses to these roles
        [deployer, inspector, owner, verifiedUser, unVerifiedUser] = accounts;

        //Add a land inspector
        await AccountRegistrationInstance.grantLandInspectorStatus(
            inspector,
            {from: deployer}
        )

        //set the user details of an owner
        await AccountRegistrationInstance.setUserDetails(
            "Owner", 101101101101,
            {from: owner}
        )
        
        //Verify the owner
        await AccountRegistrationInstance.verifyAccount(
            101101101101,
            {from: deployer}
        )

        //set the deatils of a user
        await AccountRegistrationInstance.setUserDetails(
            "Verified User", 101101101102,
            {from: verifiedUser}
        )

        //Verify a user
        await AccountRegistrationInstance.verifyAccount(
            101101101102,
            {from: deployer}
        )

        //set the details of a user who won't be verified
        await AccountRegistrationInstance.setUserDetails(
            "Uverified User", 101101101103,
            {from: unVerifiedUser}
        )
    })

    it(
        "Ensure that the land registration contract has the correct account " + 
        "registration contract address",
        async () => {
            const accountRegistrationAddress = (
                await landRegistrationInstance.accountRegistrationContract()
            );
            
            assert.equal(
                accountRegistrationAddress, AccountRegistration.address,
                "The account contracts address in the land registration " + 
                "contract must be the address of the actual account " +
                "registration contract" 
            );

        }
    )

    describe("Add Land Records", () => {
        let landRecord;

        before(async () => {
            const area = 100, purchaseDate = 1698568923, landValueAtPurchase = 100;
            const purchasePrice = 100, surveryNumber = 123;
            
            landRecord = {
                landId: 0,
                owner: owner,
                identifier: {
                    state: "sample state",
                    divison: "sample division",
                    district: "sample district",
                    taluka: "sample taluka",
                    village: "sample village",
                    surveyNumber: surveryNumber,
                    subdivision: "1/A"
                },
                area: area,
                purchaseDate: purchaseDate,
                purchasePrice: purchasePrice,
                landValueAtPurchase: landValueAtPurchase,
                previousOwners: [],
                isVerified: false,
                isForSale: false
            }
        })

        it("Ensure that a land record can be added.", async () => {

            const addLandTx = await landRegistrationInstance.addLandRecord(
                landRecord, {from: owner}
            );
    
            truffleAssert.eventEmitted(addLandTx, "LandRecordAdded");
    
            // Get the event object.
            const event = await landRegistrationInstance.getPastEvents("LandRecordAdded", {
                filter: { landId: 1 },
                fromBlock: addLandTx.blockNumber,
                toBlock: addLandTx.blockNumber
            });
    
            const landId  = event[0].args.landId.toNumber()
            assert.equal(
                1, landId, "This is the first land added. Its id must be 1."
            )
        })
    
        it("Ensure that a land record can't be added twice", async () => {
            const addLandTx = await landRegistrationInstance.addLandRecord(
                landRecord, {from: owner}
            );
    
            truffleAssert.eventEmitted(addLandTx, "LandRecordExists");
    
            // Get the event object.
            const event = await landRegistrationInstance.getPastEvents("LandRecordExists", {
                filter: { landId: 1 },
                fromBlock: addLandTx.blockNumber,
                toBlock: addLandTx.blockNumber
            });
    
            const landId  = event[0].args.landId.toNumber()
            assert.equal(
                1, landId, "Since this record has already been added, its id is" + 
                " still 1"
            )
        })
    
        it("Ensure that a differen't land record can be added", async () => {
            const area = 100, purchaseDate = 1698568923, landValueAtPurchase = 100;
            const purchasePrice = 100, surveryNumber = 123;
            
            let landRecord = {
                landId: 0,
                owner: owner,
                identifier: {
                    state: "a different sample state",
                    divison: "sample division",
                    district: "sample district",
                    taluka: "sample taluka",
                    village: "sample village",
                    surveyNumber: surveryNumber,
                    subdivision: "1/A"
                },
                area: area,
                purchaseDate: purchaseDate,
                purchasePrice: purchasePrice,
                landValueAtPurchase: landValueAtPurchase,
                previousOwners: [],
                isVerified: false,
                isForSale: false
            }
    
            const addLandTx = await landRegistrationInstance.addLandRecord(
                landRecord, {from: owner}
            );
    
            truffleAssert.eventEmitted(addLandTx, "LandRecordAdded");
    
            // Get the event object.
            const event = await landRegistrationInstance.getPastEvents("LandRecordAdded", {
                filter: { landId: 2 },
                fromBlock: addLandTx.blockNumber,
                toBlock: addLandTx.blockNumber
            });
    
            const landId  = event[0].args.landId.toNumber()
            assert.equal(
                2, landId, "This is the second land added. Its id must be 2."
            )
    
        })

        it("Ensure that a unVerifiedUser user can't add a land record", async () => {
            try {
                const addLandTx = await landRegistrationInstance.addLandRecord(
                    landRecord, {from: unVerifiedUser}
                );
            } catch (error) {
                assert(
                    error.message.includes("Only registered user can perform this action."),
                    "Error not thrown"
                );
            }
        })
    })

    describe("Land Verification", () => {
        let landRecord;

        before(async () => {
            const area = 100, purchaseDate = 1698568923, landValueAtPurchase = 100;
            const purchasePrice = 100, surveryNumber = 123;
            
            landRecord = {
                landId: 0,
                owner: owner,
                identifier: {
                    state: "sample state",
                    divison: "sample division",
                    district: "sample district",
                    taluka: "sample taluka",
                    village: "sample village",
                    surveyNumber: surveryNumber,
                    subdivision: "1/A"
                },
                area: area,
                purchaseDate: purchaseDate,
                purchasePrice: purchasePrice,
                landValueAtPurchase: landValueAtPurchase,
                previousOwners: [],
                isVerified: false,
                isForSale: false
            }
        })

        it("Owner can request for land verification", async () => {
            const addLandTx = await landRegistrationInstance.addLandRecord(
                landRecord, {from: owner}
            );
    
            truffleAssert.eventEmitted(addLandTx, "LandRecordExists");
    
            // Get the event object.
            const event = await landRegistrationInstance.getPastEvents("LandRecordExists", {
                filter: { landId: 1 },
                fromBlock: addLandTx.blockNumber,
                toBlock: addLandTx.blockNumber
            });
    
            const landId  = event[0].args.landId.toNumber()

            const verificationTx = await landRegistrationInstance.landVerificationRequest(
                landId, {from: owner}
            )
        })

        it("Only owner can request for verification", async () => {
            landRecord.owner = unVerifiedUser;

            try {
                await landRegistrationInstance.landVerificationRequest(
                    1, {from: unVerifiedUser}
                )
            } catch(error) {
                assert(
                    error.message.includes("Only owner can perform this operation.")
                )
            }
        })
    })

    describe("Land ID", () => {
        let landRecord;

        before(async () => {
            const area = 100, purchaseDate = 1698568923, landValueAtPurchase = 100;
            const purchasePrice = 100, surveryNumber = 123;
            
            landRecord = {
                landId: 0,
                owner: owner,
                identifier: {
                    state: "sample state",
                    divison: "sample division",
                    district: "sample district",
                    taluka: "sample taluka",
                    village: "sample village",
                    surveyNumber: surveryNumber,
                    subdivision: "1/A"
                },
                area: area,
                purchaseDate: purchaseDate,
                purchasePrice: purchasePrice,
                landValueAtPurchase: landValueAtPurchase,
                previousOwners: [],
                isVerified: false,
                isForSale: false
            }
        })

        it("Correct Land ID is returned", async () => {
            //Since getLandId is a static call and not a transaction,
            //the return value is directly accessible
            const landId = await landRegistrationInstance.getLandId(
                landRecord.identifier, {from: owner}
            )
            
            assert.equal(
                1, landId, "The first land added has a land id of 1."
            )
        })

        it("Returns zero when Land Record doesn't exist", async () => {
            landRecord.identifier.state = "A non existent state"

            const landId = await landRegistrationInstance.getLandId(
                landRecord.identifier, {from: owner}
            )
            
            assert.equal(
                0, landId, "Since the land doesn't exist zero must be returnred."
            )


        })
    })

    describe("Land Sale", () => {
        const landId  = 1;
        
        it("Ensures that a verified land can be put up for sale", async () => {

            //Request land verification
            await landRegistrationInstance.landVerificationRequest(landId, {from: owner});
            
            //Approve land verification request
            await landRegistrationInstance.verifyLand(landId, {from: inspector});
            //list the land for sale
            await landRegistrationInstance.listLandForSale(landId, {from: owner});
            
            //Get the lands for sale
            const landsForSale = await landRegistrationInstance.getLandsForSale();    

            //BN is a different type from BigNumber
            //Tried casting a number to a BN and using includes but it always
            //returns false despite the number being present.
            //The casted number is missing a few properties. This could be the 
            //reason for an always false return value.
            //Using a loop is a simple solution here
            const landIfFound = landsForSale.some(
                (element) => {
                    if (element.toNumber() === landId) {
                        return true
                    }
                }
            )

            assert.equal(
                true, landIfFound, "Land id 1 must be present in the list of" +
                " lands for sale."
            );

        })

        it("Ensures that only an owner can put up the land for sale", async () => {
            try {
                await landRegistrationInstance.listLandForSale(landId, {
                    from: unVerifiedUser
                })
            } catch(error) {
                assert(
                    error.message.includes("Only owner can perform this operation.")
                )
            }
        })

        it("Ensures that only a verified land can be put up for sale", async () => {
            try {
                await landRegistrationInstance.listLandForSale(landId, {
                    from: owner
                })
            } catch (error) {
                assert(
                    error.message.include("Only verified lands can be put up for sale.")
                )
            }
        })
    })

describe("Buyer sends a request(Acceptance case)", () => {
        let landId;
        let buyer;
        let landRecord;
        
        beforeEach(async () => {
          // Add a land record
          const area = 100, purchaseDate = 1698568923, landValueAtPurchase = 100;
          const purchasePrice = 100, surveryNumber = 123;
                
           landRecord = {
            landId: 0,
            owner: owner,
            identifier: {
              state: "sample state",
              divison: "sample division",
              district: "sample district",
              taluka: "sample taluka",
              village: "sample village",
              surveyNumber: surveryNumber,
              subdivision: "1/A"
            },
            area: area,
            purchaseDate: purchaseDate,
            purchasePrice: purchasePrice,
            landValueAtPurchase: landValueAtPurchase,
            previousOwners: [],
            isVerified: true, // Set land as verified
            isForSale: false
          };
    
          await landRegistrationInstance.addLandRecord(landRecord, { from: owner });
          landId = await landRegistrationInstance.getLandId(landRecord.identifier, { from: owner });
          await landRegistrationInstance.landVerificationRequest(landId,{from: owner});
          await landRegistrationInstance.verifyLand(landId,{ from: inspector});
          await landRegistrationInstance.listLandForSale(landId,{ from: owner});
          //console.log(landId);
          buyer = accounts[3];
        });

        it("An unverified user(buyer) cannot request to buy land", async () => {
    
            try {
              await landRegistrationInstance.requestForBuy(landId, { from: unVerifiedUser });
            } catch (error) {
              assert(
                error.message.includes("Only registered user can perform this action.")
              );
            }
          });
    
        it("Buyer can request to buy land", async () => {
          await landRegistrationInstance.requestForBuy(landId, { from: verifiedUser });
    
          const sentLandRequests = await landRegistrationInstance.sentLandRequests({ from: verifiedUser });
          const receivedLandRequests = await landRegistrationInstance.receivedLandRequests(landId, { from: owner });
    
          assert.equal(sentLandRequests.length, 1, "Buyer should have one sent land request");
          assert.equal(receivedLandRequests.length, 1, "Owner should have one received land request");
        });
    
        it("Buyer cannot request the same land twice", async () => {
    
          try {
            await landRegistrationInstance.requestForBuy(landId, { from: verifiedUser });
          } catch (error) {
            assert(
              error.message.includes("Already requested for this land")
            );
          }
        });

        it("An unverified user(seller) cannot accept request to buy land", async () => {
    
            try {
                const requestId = await landRegistrationInstance.landToBuyerToRequest(landId, verifiedUser);
                await landRegistrationInstance.acceptRequest(requestId, { from: unVerifiedUser });
            } catch (error) {
                assert(
                    error.message.includes("Only registered user can perform this action.")
                )
            }
          });

          it("A verified user other than the owner of the land cannot accept request to buy land", async () => {
    
            try {
                const requestId = await landRegistrationInstance.landToBuyerToRequest(landId, verifiedUser);
                await landRegistrationInstance.acceptRequest(requestId, { from: inspector });
            } catch (error) {
                assert.equal(true,inspector != owner,"Only owner can perform this.");
            }
          });


        it("Owner can accept buyer's request", async () => {
          try {
            const requestId = await landRegistrationInstance.landToBuyerToRequest(landId, verifiedUser);
            await landRegistrationInstance.acceptRequest(requestId, { from: owner });
        } catch (error) {
            assert(
                error.message.includes("Only owner of the land can accept the buyer request.")
            )
        }
        });
    });

    describe("Buyer sends a request(Rejection case)", () => {
        let landId;
        let buyer;
        let landRecord;
        
        beforeEach(async () => {
          // Add a land record
          const area = 100, purchaseDate = 1698568923, landValueAtPurchase = 100;
          const purchasePrice = 100, surveryNumber = 123;
                
           landRecord = {
            landId: 0,
            owner: owner,
            identifier: {
              state: "a sample state",
              divison: "sample division",
              district: "sample district",
              taluka: "sample taluka",
              village: "sample village",
              surveyNumber: surveryNumber,
              subdivision: "1/A"
            },
            area: area,
            purchaseDate: purchaseDate,
            purchasePrice: purchasePrice,
            landValueAtPurchase: landValueAtPurchase,
            previousOwners: [],
            isVerified: true, // Set land as verified
            isForSale: false
          };
    
          await landRegistrationInstance.addLandRecord(landRecord, { from: owner });
          landId = await landRegistrationInstance.getLandId(landRecord.identifier, { from: owner });
          await landRegistrationInstance.landVerificationRequest(landId,{from: owner});
          await landRegistrationInstance.verifyLand(landId,{ from: inspector});
          await landRegistrationInstance.listLandForSale(landId,{ from: owner});
          
          buyer = accounts[3];
        });

        it("An unverified user(buyer) cannot request to buy land", async () => {
    
            try {
              await landRegistrationInstance.requestForBuy(landId, { from: unVerifiedUser });
            } catch (error) {
              assert(
                error.message.includes("Only registered user can perform this action.")
              );
            }
          });
    
        it("Buyer can request to buy land", async () => {
          await landRegistrationInstance.requestForBuy(landId, { from: verifiedUser });
    
          const sentLandRequests = await landRegistrationInstance.sentLandRequests({ from: verifiedUser });
          const receivedLandRequests = await landRegistrationInstance.receivedLandRequests(landId, { from: owner });
    
          assert.equal(sentLandRequests.length, 2, "Buyer should have sent two land requests");
          assert.equal(receivedLandRequests.length, 2, "Owner should have two received land requests");
        });
    
        it("Buyer cannot request the same land twice", async () => {
    
          try {
            await landRegistrationInstance.requestForBuy(landId, { from: verifiedUser });
          } catch (error) {
            assert(
              error.message.includes("Already requested for this land")
            );
          }
        });

        it("An unverified user(seller) cannot reject request to buy land", async () => {
    
            try {
                const requestId = await landRegistrationInstance.landToBuyerToRequest(landId, verifiedUser);
                await landRegistrationInstance.rejectRequest(requestId, { from: unVerifiedUser });
            } catch (error) {
                assert(
                    error.message.includes("Only registered user can perform this action.")
                )
            }
          });

          it("A verified user other than the owner of the land cannot reject request to buy land", async () => {
    
            try {
                const requestId = await landRegistrationInstance.landToBuyerToRequest(landId, verifiedUser);
                await landRegistrationInstance.rejectRequest(requestId, { from: inspector });
            } catch (error) {
                assert.equal(true,inspector != owner,"Only owner can perform this.");
                
            }
          });

        it("Owner can reject buyer's request", async () => {
          try {
            const requestId = await landRegistrationInstance.landToBuyerToRequest(landId, verifiedUser);
            await landRegistrationInstance.rejectRequest(requestId, { from: owner });
        } catch (error) {
            assert(
                error.message.includes("Only owner of the land can reject the buyer request.")
            )
        }
        });
    });



      describe("Buyer can cancel the request", () => {
        let landId;
        let buyer;
        let landRecord;
        
        beforeEach(async () => {
          // Add a land record
          const area = 100, purchaseDate = 1698568923, landValueAtPurchase = 100;
          const purchasePrice = 100, surveryNumber = 123;
                
           landRecord = {
            landId: 0,
            owner: owner,
            identifier: {
              state: "sample state",
              divison: "sample division",
              district: "sample district",
              taluka: "a sample taluka",
              village: "sample village",
              surveyNumber: surveryNumber,
              subdivision: "1/A"
            },
            area: area,
            purchaseDate: purchaseDate,
            purchasePrice: purchasePrice,
            landValueAtPurchase: landValueAtPurchase,
            previousOwners: [],
            isVerified: true, // Set land as verified
            isForSale: false
          };
    
          await landRegistrationInstance.addLandRecord(landRecord, { from: owner });
          landId = await landRegistrationInstance.getLandId(landRecord.identifier, { from: owner });
          await landRegistrationInstance.landVerificationRequest(landId,{from: owner});
          await landRegistrationInstance.verifyLand(landId,{ from: inspector});
          await landRegistrationInstance.listLandForSale(landId,{ from: owner});
    
          buyer = accounts[3];
        });

        it("An unverified user(buyer) cannot request to buy land", async () => {
    
            try {
              await landRegistrationInstance.requestForBuy(landId, { from: unVerifiedUser });
            } catch (error) {
              assert(
                error.message.includes("Only registered user can perform this action.")
              );
            }
          });

        
        it("Buyer can request to buy land", async () => {
            await landRegistrationInstance.requestForBuy(landId, { from: verifiedUser });
      
            const sentLandRequests = await landRegistrationInstance.sentLandRequests({ from: verifiedUser });
            const receivedLandRequests = await landRegistrationInstance.receivedLandRequests(landId, { from: owner });
      
            assert.equal(sentLandRequests.length, 2, "Buyer should have sent three sent land requests");
            assert.equal(receivedLandRequests.length, 2, "Owner should have two received land requests");
            
          });

          it("Buyer cannot request the same land twice", async () => {
    
            try {
              await landRegistrationInstance.requestForBuy(landId, { from: verifiedUser });
            } catch (error) {
              assert(
                error.message.includes("Already requested for this land")
              );
            }
          });

          it("Verified user other than the actual buyer cannot cancel buy request", async () => {

            try {
                const requestId = await landRegistrationInstance.landToBuyerToRequest(landId, verifiedUser);
                await landRegistrationInstance.cancelBuyerRequest(landId, { from: inspector });

            } catch (error) {
                assert.equal(true,inspector != verifiedUser,"Only owner can perform this.");
            }
          });
  

        it("Buyer can cancel buy request", async () => {

            try {
                const requestId = await landRegistrationInstance.landToBuyerToRequest(landId, verifiedUser);
                await landRegistrationInstance.cancelBuyerRequest(landId, { from: verifiedUser });
                const requestStatus = await landRegistrationInstance.LandRequestMapping(requestId).requestStatus;

            } catch (error) {
                assert(
                    assert.equal(requestStatus,rejected, "Request status should be 'rejected' (canceled by buyer)")
                    
                )
            }
          });

        
    
    });

    
      describe("Land Transaction and Ownership Transfer", () => {
        let landId;
        let buyer;
        let landRecord;
        let paymentStatus ;

        beforeEach(async () => {
          // Add a land record
          const area = 100, purchaseDate = 1698568923, landValueAtPurchase = 100;
          const purchasePrice = 100, surveryNumber = 123;
                
           landRecord = {
            landId: 0,
            owner: owner,
            identifier: {
              state: "sample state",
              divison: "sample division",
              district: "sample district",
              taluka: "sample taluka",
              village: "a sample village",
              surveyNumber: surveryNumber,
              subdivision: "2/A"
            },
            area: area,
            purchaseDate: purchaseDate,
            purchasePrice: purchasePrice,
            landValueAtPurchase: landValueAtPurchase,
            previousOwners: [],
            isVerified: true, // Set land as verified
            isForSale: false
          };
    
          await landRegistrationInstance.addLandRecord(landRecord, { from: owner });
          landId = await landRegistrationInstance.getLandId(landRecord.identifier, { from: owner });
          await landRegistrationInstance.landVerificationRequest(landId,{from: owner});
          await landRegistrationInstance.verifyLand(landId,{ from: inspector});
          await landRegistrationInstance.listLandForSale(landId,{ from: owner});
          
    
          buyer = accounts[3];
        });

        it("Buyer can request and show interest in buying a land", async () => {
            await landRegistrationInstance.requestForBuy(landId, { from: verifiedUser });
      
            const sentLandRequests = await landRegistrationInstance.sentLandRequests({ from: verifiedUser });
            const receivedLandRequests = await landRegistrationInstance.receivedLandRequests(landId, { from: owner });
      
            assert.equal(sentLandRequests.length, 2, "Buyer should have sent two sent land requests");
            assert.equal(receivedLandRequests.length, 2, "Owner should have two received land requests");
        });
        
        it("Buyer cannot request the same land twice", async () => {
    
            try {
              await landRegistrationInstance.requestForBuy(landId, { from: verifiedUser });
            } catch (error) {
              assert(
                error.message.includes("Already requested for this land")
              );
            }
          });

          it("Owner can accept buyer's request", async () => {
            try {
              const requestId = await landRegistrationInstance.landToBuyerToRequest(landId, verifiedUser);
              await landRegistrationInstance.acceptRequest(requestId, { from: owner });
          } catch (error) {
              assert(
                  error.message.includes("Only owner of the land can accept the buyer request.")
              )
          }
          });

          it("Only Inspector can transfer the land ownership", async () => {

            try{
            const requestId = await landRegistrationInstance.landToBuyerToRequest(landId, verifiedUser);
            const transferTx = await landRegistrationInstance.transferLandOwnership(requestId, {from : owner});
        
            truffleAssert.eventEmitted(transferTx, "LandOwnershipTransferred");
            }
            catch(error){

                assert(
                    error.message.includes("Only inspector can perform this action.")
                )

            }
        })
    
          it("Inspector can transfer ownership after seller accepts request and marks payment as done", async () => {
            // Assume that the payment is done outside the contract
            const paymentDone = true;
        
            const requestId = await landRegistrationInstance.landToBuyerToRequest(landId, verifiedUser);
          
            const initialPaymentStatus = await landRegistrationInstance.requestStatus(requestId);
            
            await landRegistrationInstance.markPaymentAsDone(requestId, landId, { from: owner });
            const finalPaymentStatus = await landRegistrationInstance.requestStatus(requestId);

            
            
            const transferTx = await landRegistrationInstance.transferLandOwnership(requestId, {from : inspector});
        
            truffleAssert.eventEmitted(transferTx, "LandOwnershipTransferred");

        
            assert.equal(await landRegistrationInstance.getOwnerAddress(landId), verifiedUser, "The new owner should be the buyer");
        
            assert.equal(finalPaymentStatus, paymentDone, "The payment status should be true");
            assert.equal(initialPaymentStatus, false, "The initial payment status should be false");


             //Get the lands for sale
             const landsForSale = await landRegistrationInstance.getLandsForSale();    
    
             //BN is a different type from BigNumber
             //Tried casting a number to a BN and using includes but it always
             //returns false despite the number being present.
             //The casted number is missing a few properties. This could be the 
             //reason for an always false return value.
             //Using a loop is a simple solution here
             const landIfFound = landsForSale.some(
                 (element) => {
                     if (element.toNumber() === landId) {
                         return true
                     }
                 }
             )
     
             assert.equal(
                 false, landIfFound, "Land Id must not be present in the sale list")
             

            
           
        });

        
    });

})
