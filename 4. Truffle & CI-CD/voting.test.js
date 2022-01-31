const { BN, expectEvent, expectRevert} = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const voting = artifacts.require('Voting');
contract('Voting', function (accounts) {
    const owner = accounts[0];
    const VoterOne = accounts[1];
    const VoterTwo = accounts[2];
    const VoterThree = accounts[3];
    const VoterFour = accounts[4];
 
    beforeEach(async function () {
        this.votingInstance = await voting.new({from: owner});
    });

    describe('should set up vote', () => {
        it('should verify if status is RegisteringVoters', async function (){
            expect(await this.votingInstance.status()).to.be.bignumber.equal(new BN(0));
        });
    
        it('should reset proposals and whitelist', async function() {
            let voterRegistered = await this.votingInstance.whitelist(VoterOne, {from: owner});
            expectEvent(voterRegistered, 'VoterRegistered', {
                voterAddress: VoterOne,
              });
            expect(await this.votingInstance.addressUsed(0)).to.be.equal(VoterOne);
            await this.votingInstance.updateStatus({from: owner});
            await this.votingInstance.proposalRegister("description 1ere proposition", {from: VoterOne});
            let firstProposal = await this.votingInstance.proposals(0);
            expect(firstProposal.description).to.be.equal("description 1ere proposition");
            await this.votingInstance.updateStatus({from: owner});
            await this.votingInstance.updateStatus({from: owner});
            await this.votingInstance.updateStatus({from: owner});
            await this.votingInstance.updateStatus({from: owner});
            await this.votingInstance.updateStatus({from: owner});
            await this.votingInstance.proposalsReset({from: owner});
            await expectRevert(
                this.votingInstance.proposals(0, { from: owner}),
                'revert',
              );
            await this.votingInstance.whitelistReset({from: owner});
            await expectRevert(
                this.votingInstance.addressUsed(0, { from: owner}),
                'revert',
              );
        });
    
        it('should add voter to whiteList', async function (){
            await expectRevert(
                this.votingInstance.addressUsed(0, { from: owner}),
                'revert',
              );
            await this.votingInstance.whitelist(VoterOne, {from: owner});
            expect(await this.votingInstance.addressUsed(0)).to.be.equal(VoterOne);
        });
    
        it('should update status with', async function() {
            expect(await this.votingInstance.status()).to.be.bignumber.equal(new BN(0));
            let status = await this.votingInstance.updateStatus({from: owner});
            expectEvent(status, 'WorkflowStatusChange', {
                previousStatus: new BN(0),
                newStatus: new BN(1)
              });
            expect(await this.votingInstance.status()).to.be.bignumber.equal(new BN(1));
            status = await this.votingInstance.updateStatus({from: owner});
            expectEvent(status, 'WorkflowStatusChange', {
                previousStatus: new BN(1),
                newStatus: new BN(2)
              });
            expect(await this.votingInstance.status()).to.be.bignumber.equal(new BN(2));
            status = await this.votingInstance.updateStatus({from: owner});
            expectEvent(status, 'WorkflowStatusChange', {
                previousStatus: new BN(2),
                newStatus: new BN(3)
              });           
            expect(await this.votingInstance.status()).to.be.bignumber.equal(new BN(3));
            status = await this.votingInstance.updateStatus({from: owner});
            expectEvent(status, 'WorkflowStatusChange', {
                previousStatus: new BN(3),
                newStatus: new BN(4)
              });
            expect(await this.votingInstance.status()).to.be.bignumber.equal(new BN(4));
            status = await this.votingInstance.updateStatus({from: owner});
            expectEvent(status, 'WorkflowStatusChange', {
                previousStatus: new BN(4),
                newStatus: new BN(5)
              });
            expect(await this.votingInstance.status()).to.be.bignumber.equal(new BN(5));
            status = await this.votingInstance.updateStatus({from: owner});
            expectEvent(status, 'WorkflowStatusChange', {
                previousStatus: new BN(5),
                newStatus: new BN(0)
            });
        });

        it('should not update status if not owner', async function() {
            expect(await this.votingInstance.status()).to.be.bignumber.equal(new BN(0));
            await expectRevert(
                this.votingInstance.updateStatus({from: VoterOne}),
                'Ownable: caller is not the owner -- Reason given: Ownable: caller is not the owner',
              );
        });
    });
    
    describe('should manage registration', () => {
        beforeEach(async function () {
            await this.votingInstance.whitelist(VoterOne, {from: owner});
            await this.votingInstance.updateStatus({from: owner});
        });
        it('and register a proposal', async function(){
            const proposalRegister = await this.votingInstance.proposalRegister("description 1ere proposition", {from: VoterOne});
            expectEvent(proposalRegister, 'ProposalRegistered', {
                proposalId: new BN(1),
            });
            await this.votingInstance.proposalRegister("description 2eme proposition", {from: VoterOne});
            let firstProposal = await this.votingInstance.proposals(0);
            let secondProposal = await this.votingInstance.proposals(1);
            expect(firstProposal.description).to.be.equal("description 1ere proposition");
            expect(secondProposal.description).to.be.equal("description 2eme proposition");
        });
    
        it('and register a vote for a proposal', async function(){
            await this.votingInstance.proposalRegister("description 1ere proposition", {from: VoterOne});
            await this.votingInstance.updateStatus({from: owner});
            await this.votingInstance.updateStatus({from: owner});
            let voteRegister = await this.votingInstance.voterRegister(0, {from: VoterOne});
            let firstProposal = await this.votingInstance.proposals(0);
            expect(firstProposal.voteCount).to.be.bignumber.equal(new BN(1));
            expectEvent(voteRegister, 'Voted', {
                voter: VoterOne,
                proposalId: new BN(0),
              });
        });

        it('and not register a vote for a proposal is not the VotingSessionStarted status', async function(){
            await this.votingInstance.proposalRegister("description 1ere proposition", {from: VoterOne});
            await expectRevert(
                this.votingInstance.voterRegister(0, { from: owner}),
                'revert',
              );
        });
    
        it('and not register a vote if voter has already vote', async function(){
            await this.votingInstance.proposalRegister("description 1ere proposition", {from: VoterOne});
            await this.votingInstance.updateStatus({from: owner});
            await this.votingInstance.updateStatus({from: owner});
            await this.votingInstance.voterRegister(0, {from: VoterOne});
            await expectRevert(
                this.votingInstance.voterRegister(0, { from: owner}),
                'revert',
              );
        });
    });

    describe('should check the winning proposal', () => {
        beforeEach(async function () {
            await this.votingInstance.whitelist(VoterOne, {from: owner});
            await this.votingInstance.whitelist(VoterTwo, {from: owner});
            await this.votingInstance.whitelist(VoterThree, {from: owner});
            await this.votingInstance.whitelist(VoterFour, {from: owner});
            await this.votingInstance.updateStatus({from: owner});
            await this.votingInstance.proposalRegister("description 1ere proposition", {from: VoterOne});
            await this.votingInstance.proposalRegister("description 2eme proposition", {from: VoterOne});
            await this.votingInstance.updateStatus({from: owner});
            await this.votingInstance.updateStatus({from: owner});
        });
        it('and return winning proposal id 1 ', async function() {
            await this.votingInstance.voterRegister(1, {from: VoterOne});
            await this.votingInstance.voterRegister(1, {from: VoterTwo});
            await this.votingInstance.voterRegister(1, {from: VoterThree});
            await this.votingInstance.voterRegister(0, {from: VoterFour});
            expect(await this.votingInstance.winningProposalId()).to.be.bignumber.equal(new BN(1));
        })
        it('and return winning proposal id 0 ', async function() {
            await this.votingInstance.voterRegister(0, {from: VoterOne});
            await this.votingInstance.voterRegister(0, {from: VoterTwo});
            await this.votingInstance.voterRegister(0, {from: VoterThree});
            await this.votingInstance.voterRegister(1, {from: VoterFour});
            expect(await this.votingInstance.winningProposalId()).to.be.bignumber.equal(new BN(0));
        })
    });
});