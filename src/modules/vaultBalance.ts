import {
  ActionInterface,
  VaultBalanceInterface,
  StateInterface
} from "../faces";

export default function VaultBalance(
  state: StateInterface,
  action: ActionInterface
) {
  const caller = action.caller;

  const input: VaultBalanceInterface = action.input;
  const target = input.target || caller;

  ContractAssert(
    /[a-z0-9_-]{43}/i.test(target),
    "Caller did not supply a valid target."
  );

  const vault = state.vault;
  let balance = 0;

  // get balance from vault
  if (target in vault) {
    const blockHeight = +SmartWeave.block.height;
    const filtered = vault[target].filter((a) => blockHeight < a.end);

    // add each vault item that has not expired
    for (const vaultItem of filtered) {
      balance += vaultItem.balance;
    }
  }

  return { target, balance };
}
