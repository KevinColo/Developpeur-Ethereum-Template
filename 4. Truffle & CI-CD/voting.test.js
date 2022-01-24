const { BN } = require('@openzeppelin/test-helpers');
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

    it('should verify is status is RegisteringVoters', async function (){
        expect(await this.votingInstance.status()).to.be.bignumber.equal(new BN(0));
    });

    it('should reset proposals and whitelist', async function() {
        await this.votingInstance.whitelist(VoterOne, {from: owner});
        expect(await this.votingInstance.addressUsed(0)).to.be.equal(VoterOne);
        await this.votingInstance.updateStatus({from: owner});
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
        try {
            await this.votingInstance.proposals(0);
        } catch (err) {
            assert.include(err.message, "revert", "The error message should contain 'revert'");
        }
        await this.votingInstance.whitelistReset({from: owner});
        try {
            await this.votingInstance.addressUsed(0);
        } catch (err) {
            assert.include(err.message, "revert", "The error message should contain 'revert'");
        }
    })

    it('should add voter to whiteList', async function (){
        try {
            await this.votingInstance.addressUsed(0);
        } catch (err) {
            assert.include(err.message, "revert", "The error message should contain 'revert'");
        }
        await this.votingInstance.whitelist(VoterOne, {from: owner});
        expect(await this.votingInstance.addressUsed(0)).to.be.equal(VoterOne);
    });

    it('should update status', async function() {
        expect(await this.votingInstance.status()).to.be.bignumber.equal(new BN(0));
        await this.votingInstance.updateStatus({from: owner});
        await this.votingInstance.updateStatus({from: owner});
        expect(await this.votingInstance.status()).to.be.bignumber.equal(new BN(1));
        await this.votingInstance.updateStatus({from: owner});
        expect(await this.votingInstance.status()).to.be.bignumber.equal(new BN(2));
        await this.votingInstance.updateStatus({from: owner});
        expect(await this.votingInstance.status()).to.be.bignumber.equal(new BN(3));
        await this.votingInstance.updateStatus({from: owner});
        expect(await this.votingInstance.status()).to.be.bignumber.equal(new BN(4));
        await this.votingInstance.updateStatus({from: owner});
        expect(await this.votingInstance.status()).to.be.bignumber.equal(new BN(5));
        await this.votingInstance.updateStatus({from: owner});
        expect(await this.votingInstance.status()).to.be.bignumber.equal(new BN(0));
    });

    it('should register a proposal', async function(){
        await this.votingInstance.whitelist(VoterOne, {from: owner});
        await this.votingInstance.updateStatus({from: owner});
        await this.votingInstance.updateStatus({from: owner});
        await this.votingInstance.proposalRegister("description 1ere proposition", {from: VoterOne});
        await this.votingInstance.proposalRegister("description 2eme proposition", {from: VoterOne});
        let firstProposal = await this.votingInstance.proposals(0);
        let secondProposal = await this.votingInstance.proposals(1);
        expect(firstProposal.description).to.be.equal("description 1ere proposition");
        expect(secondProposal.description).to.be.equal("description 2eme proposition");
    });

    it('should register a vote for a proposal', async function(){
        await this.votingInstance.whitelist(VoterOne, {from: owner});
        await this.votingInstance.updateStatus({from: owner});
        await this.votingInstance.updateStatus({from: owner});
        await this.votingInstance.proposalRegister("description 1ere proposition", {from: VoterOne});
        await this.votingInstance.updateStatus({from: owner});
        await this.votingInstance.updateStatus({from: owner});
        await this.votingInstance.voterRegister(0, {from: VoterOne});
        let firstProposal = await this.votingInstance.proposals(0);
        expect(firstProposal.voteCount).to.be.bignumber.equal(new BN(1));
    });

    it('should not register a vote if voter has already vote', async function(){
        await this.votingInstance.whitelist(VoterOne, {from: owner});
        await this.votingInstance.updateStatus({from: owner});
        await this.votingInstance.updateStatus({from: owner});
        await this.votingInstance.proposalRegister("description 1ere proposition", {from: VoterOne});
        await this.votingInstance.updateStatus({from: owner});
        await this.votingInstance.updateStatus({from: owner});
        await this.votingInstance.voterRegister(0, {from: VoterOne});
        try {
            await this.votingInstance.voterRegister(0, {from: VoterOne});
        } catch (err) {
            assert.include(err.message, "revert", "The error message should contain 'toto'");
        }
    });

    it('should return winning proposal id', async function() {
        await this.votingInstance.whitelist(VoterOne, {from: owner});
        await this.votingInstance.whitelist(VoterTwo, {from: owner});
        await this.votingInstance.whitelist(VoterThree, {from: owner});
        await this.votingInstance.whitelist(VoterFour, {from: owner});
        await this.votingInstance.updateStatus({from: owner});
        await this.votingInstance.updateStatus({from: owner});
        await this.votingInstance.proposalRegister("description 1ere proposition", {from: VoterOne});
        await this.votingInstance.proposalRegister("description 2eme proposition", {from: VoterOne});
        await this.votingInstance.updateStatus({from: owner});
        await this.votingInstance.updateStatus({from: owner});
        await this.votingInstance.voterRegister(1, {from: VoterOne});
        await this.votingInstance.voterRegister(1, {from: VoterTwo});
        await this.votingInstance.voterRegister(1, {from: VoterThree});
        await this.votingInstance.voterRegister(0, {from: VoterFour});
        expect(await this.votingInstance.winningProposalId()).to.be.bignumber.equal(new BN(1));
    })
});