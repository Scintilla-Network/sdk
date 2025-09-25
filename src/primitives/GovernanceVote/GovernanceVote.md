## GovernanceVote

```javascript
import { GovernanceVote } from '@scintilla/ts-sdk';

const governanceVote = new GovernanceVote({
    proposal: 'proposal',
    vote: 'vote',
    dao: 'dao',
    timestamp: 1000,
    voter: 'voter',
});
```

### Properties

- `proposal`: The proposal being voted on.
- `vote`: The vote being cast.
- `dao`: The DAO being voted on.
- `timestamp`: The timestamp of the vote.
- `voter`: The voter casting the vote.

### Methods