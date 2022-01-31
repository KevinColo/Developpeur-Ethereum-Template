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
    
    uint8 idStatus = 0;
    mapping(address => Voter) private _whitelist;
    Proposal[] public proposals;
    WorkflowStatus public status;
    address[] addressUsed;

    event VoterRegistered(address voterAddress);
    event ProposalsRegistrationStarted();
    event ProposalsRegistrationEnded();
    event ProposalRegistered(uint proposalId);
    event VotingSessionStarted();
    event VotingSessionEnded();
    event Voted (address voter, uint proposalId);
    event VotesTallied();
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    //modifier
   
    //constructor
   
    //functions   
    function whitelist(address _address) public onlyOwner {
        require (status == WorkflowStatus.RegisteringVoters);
        _whitelist[_address].isRegistered = true;
        emit VoterRegistered(_address);
    }

    function proposalsReset() public onlyOwner {
        require (status == WorkflowStatus.RegisteringVoters);
        delete proposals;
    }

     function whitelistReset() public onlyOwner {
        require (status == WorkflowStatus.RegisteringVoters);
        for(uint i=0; i<addressUsed.length; i++){
            _whitelist[addressUsed[i]] = Voter(false, false, 0);
        }
        delete addressUsed;
    }
   
    function voterRegister(uint _proposalId) public {
        require (_whitelist[msg.sender].isRegistered 
            && status == WorkflowStatus.VotingSessionStarted
            && !_whitelist[msg.sender].hasVoted);
        _whitelist[msg.sender].hasVoted = true;
        _whitelist[msg.sender].votedProposalId = _proposalId;
        proposals[_proposalId].voteCount++;
        emit Voted(msg.sender, _proposalId);
    }
   
    function proposalRegister(string memory _description) public {
        require (_whitelist[msg.sender].isRegistered == true && status == WorkflowStatus.ProposalsRegistrationStarted);
        proposals.push(Proposal(_description, 0));
        emit ProposalRegistered(proposals.length);
    }
    
    function winningProposal() public view returns (uint winningProposalId)
    {
        uint winningProposalCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningProposalCount) {
                winningProposalCount = proposals[p].voteCount;
                winningProposalId = p;
            }
        }
    }

    function emitWorkflowStatus(WorkflowStatus _status) private {
        if (_status == WorkflowStatus.ProposalsRegistrationStarted) {
            emit ProposalsRegistrationStarted();
        } else if (_status == WorkflowStatus.ProposalsRegistrationEnded) {
            emit ProposalsRegistrationEnded();
        } else if (_status == WorkflowStatus.VotingSessionStarted) {
            emit VotingSessionStarted();
        } else if (_status == WorkflowStatus.VotingSessionEnded) {
            emit VotingSessionEnded();
        } else if (_status == WorkflowStatus.VotesTallied){
            emit VotesTallied();
        }
    }
   
    function updateStatus() public onlyOwner {
        status = WorkflowStatus(idStatus);
        uint8 idPreviousStatus = idStatus == 0 && idStatus !=5 ? 5 : idStatus-1;
        emit WorkflowStatusChange(WorkflowStatus(idPreviousStatus), status);
        emitWorkflowStatus(status);
        idStatus == 5 ? idStatus = 0 : idStatus++;
    }
}