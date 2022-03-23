import {
  ActionInterface,
  StateInterface,
  FinalizeInterface,
  VoteInterface,
  VaultParamsInterface
} from "../faces";

export default function Finalize(
  state: StateInterface,
  action: ActionInterface
) {
  const input: FinalizeInterface = action.input;
  const id = input.id;

  const votes = state.votes;

  const vote: VoteInterface = votes[id];
  const qty: number = vote.qty;

  ContractAssert(!!vote, "This vote doesn't exist");

  const settings = new Map(state.settings);

  ContractAssert(
    +SmartWeave.block.height >= vote.start + settings.get("voteLength"),
    "Vote has not yet concluded"
  );
  ContractAssert(vote.status === "active", "Vote is not active");

  // Check this total supply and quorum.
  if (vote.totalWeight * settings.get("quorum") > vote.yays + vote.nays) {
    vote.status = "quorumFailed";

    return state;
  }

  const vault = state.vault;
  const balances = state.balances;

  if (
    vote.yays !== 0 &&
    (vote.nays === 0 || vote.yays / vote.nays > settings.get("support"))
  ) {
    vote.status = "passed";

    if (vote.type === "mint" || vote.type === "mintLocked") {
      let totalSupply = 0;
      const vaultValues = Object.values(vault);

      for (const locked of vaultValues) {
        for (const lockedItem of locked) {
          totalSupply += lockedItem.balance;
        }
      }

      const balancesValues = Object.values(balances);

      for (const balance of balancesValues) {
        totalSupply += balance;
      }

      ContractAssert(
        totalSupply + qty <= Number.MAX_SAFE_INTEGER,
        "Quantity is too large"
      );
    }

    if (vote.type === "mint") {
      if (vote.recipient in balances) {
        // Wallet already exists in state, add new tokens
        balances[vote.recipient] += qty;
      } else {
        // Wallet is new, set starting balance
        balances[vote.recipient] = qty;
      }
    } else if (vote.type === "mintLocked") {
      const start = +SmartWeave.block.height;
      const end = start + vote.lockLength;

      const locked: VaultParamsInterface = {
        balance: qty,
        start,
        end
      };

      if (vote.recipient in vault) {
        // Existing account
        vault[vote.recipient].push(locked);
      } else {
        // New locked account
        vault[vote.recipient] = [locked];
      }
    } else if (vote.type === "burnVault") {
      if (vote.target in vault) {
        delete vault[vote.target];
      } else {
        vote.status = "failed";
      }
    } else if (vote.type === "set") {
      if (vote.key === "role") {
        state.roles[vote.recipient] = vote.value;
      } else {
        settings.set(vote.key, vote.value);
        state.settings = Array.from(settings);
      }
    }
  } else {
    vote.status = "failed";
  }

  return state;
}
