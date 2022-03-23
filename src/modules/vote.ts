import { ActionInterface, StateInterface, VoteActionInterface } from "../faces";
import { RESTRICT_TO_INTEGER } from "../utils";

export default function Vote(state: StateInterface, action: ActionInterface) {
  const input: VoteActionInterface = action.input;
  const caller = action.caller;

  const id = input.id;
  const cast = input.cast;

  ContractAssert(
    Number.isInteger(id) || !RESTRICT_TO_INTEGER,
    'Invalid value for "id". Must be an integer'
  );

  const votes = state.votes;
  const vote = votes[id];
  const vault = state.vault;

  let voterBalance = 0;

  if (caller in vault) {
    for (let i = 0, j = vault[caller].length; i < j; i++) {
      const locked = vault[caller][i];

      if (locked.start < vote.start && locked.end >= vote.start) {
        voterBalance += locked.balance * (locked.end - locked.start);
      }
    }
  }

  ContractAssert(
    voterBalance > 0,
    "Caller does not have locked balances for this vote"
  );
  ContractAssert(!vote.voted.includes(caller), "Caller has already voted");

  const settings = new Map(state.settings);

  ContractAssert(
    +SmartWeave.block.height < vote.start + settings.get("voteLength"),
    "Vote has already concluded"
  );

  if (cast === "yay") {
    vote.yays += voterBalance;
  } else if (cast === "nay") {
    vote.nays += voterBalance;
  } else {
    throw new ContractError("Vote cast type unrecognised");
  }

  vote.voted.push(caller);

  return state;
}
