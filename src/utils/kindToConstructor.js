import { Transition } from '../primitives/Transition/Transition.js';
import { Transaction } from '../primitives/Transaction/Transaction.js';
import { Transfer } from '../primitives/Transfer/Transfer.js';
import { Voucher } from '../primitives/Voucher/Voucher.js';
import { Asset } from '../primitives/Asset/Asset.js';
import { Identity } from '../primitives/Identity/Identity.js';
import { Instruction } from '../primitives/Instruction/Instruction.js';
import { RelayBlock } from '../primitives/RelayBlock/RelayBlock.js';
import { GovernanceProposal } from '../primitives/GovernanceProposal/GovernanceProposal.js';
import { GovernanceVote } from '../primitives/GovernanceVote/GovernanceVote.js';
import { PeerInfoMessage } from '../primitives/messages/PeerInfoMessage/PeerInfoMessage.js';
import { QuorumDecision } from '../primitives/QuorumDecision/QuorumDecision.js';
import { QuorumDecisionVote } from '../primitives/QuorumDecisionVote/QuorumDecisionVote.js';

function kindToConstructor(kind) {
    switch(kind){
        case 'TRANSITION':
            return Transition;
        case 'TRANSACTION':
            return Transaction;
        case 'TRANSFER':
            return Transfer;
        case 'VOUCHER':
            return Voucher;
        case 'ASSET':
            return Asset;
        case 'IDENTITY':
            return Identity;
        case 'INSTRUCTION':
            return Instruction;
        case 'RELAYBLOCK':
            return RelayBlock;
        case 'GOVERNANCEPROPOSAL':
            return GovernanceProposal;
        case 'GOVERNANCEVOTE':
            return GovernanceVote;
        case 'PEERINFO':
            return PeerInfoMessage;
        case 'QUORUMDECISION':
            return QuorumDecision;
        case 'QUORUMDECISIONVOTE':
            return QuorumDecisionVote;
    default:
        console.log(`- kindToConstructor. unknown kind: ${kind}`);
        throw new Error(`Unknown kind: ${kind}}`);
    }
}

export { kindToConstructor };
export default kindToConstructor;