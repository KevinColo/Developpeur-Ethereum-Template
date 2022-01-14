// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Voting is Ownable {
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
    }

    struct Proposal {
        string description;
        uint voteCount;
    }
   
    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }
   
    uint proposalId = 1;
    uint8 idStatus = 0;
    mapping(address => Voter) private _whitelist;
    address[] addressUsed;
    Proposal[] public proposals;
    WorkflowStatus public status;
    uint winningProposalId;
   
    event VoterRegistered(address voterAddress);
    event ProposalRegistered(uint proposalId);
    event Voted (address voter, uint proposalId);
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
   
    //modifier
    modifier isRegisteringVotersStatus() {
        require (status == WorkflowStatus.RegisteringVoters);
        _;
    }

    modifier isRegisteredUser(address _address) {
        require (_whitelist[_address].isRegistered);
        _;
    }
   
    //functions  
    function whitelist(address _address) public onlyOwner isRegisteringVotersStatus {      
        _whitelist[_address] = Voter(true, false, 0);
        addressUsed.push(_address);
       
        emit VoterRegistered(_address);
    }

    function proposalsReset() public onlyOwner isRegisteringVotersStatus{
        delete proposals;
    }

    function whitelistReset() public onlyOwner isRegisteringVotersStatus{
        for(uint i=0; i<addressUsed.length; i++){
            _whitelist[addressUsed[i]] = Voter(false, false, 0);
        }
        delete addressUsed;
    }
   
    function voterRegister(uint _proposalId) public isRegisteredUser(msg.sender) {
        require (status == WorkflowStatus.VotingSessionStarted
            && !_whitelist[msg.sender].hasVoted);
        _whitelist[msg.sender].hasVoted = true;
        _whitelist[msg.sender].votedProposalId = _proposalId;
       
        proposals[_proposalId].voteCount++;
       
        if (proposals[_proposalId].voteCount > proposals[winningProposalId].voteCount) {
            winningProposalId = _proposalId;
        }
        emit Voted(msg.sender, _proposalId);
    }
   
    // Registering proposals of voters 
    function proposalRegister(string memory _description) public isRegisteredUser(msg.sender) {
        require (status == WorkflowStatus.ProposalsRegistrationStarted);
        require (proposals.length < 10000);
        proposals.push(Proposal(_description, 0));
        emit ProposalRegistered(proposals.length);
    }
   
    function winningProposal() public view returns (uint _winningProposalId)
    {
        uint winningProposalCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningProposalCount) {
                winningProposalCount = proposals[p].voteCount;
                _winningProposalId = p;
            }
        }
    }
   
   // update status 
    function updateStatus() public onlyOwner {
        status = WorkflowStatus(idStatus);
        uint8 idPreviousStatus = idStatus == 0 && idStatus !=5 ? 5 : idStatus-1;
        emit WorkflowStatusChange(WorkflowStatus(idPreviousStatus), status);
        idStatus == 5 ? idStatus = 0 : idStatus++;
    }
}
