import { ActionInterface, BalanceInterface, StateInterface } from "../faces";

export default function Balance(
  state: StateInterface,
  action: ActionInterface
) {
  const caller = action.caller;

  const input: BalanceInterface = action.input;
  const target = input.target || caller;

  ContractAssert(
    /[a-z0-9_-]{43}/i.test(target),
    "Caller did not supply a valid target."
  );

  const balances = state.balances;
  const vault = state.vault;
  let balance = 0;

  // get balance from unlocked balances
  if (target in balances) {
    balance = balances[target];
  }

  // get balance from vault
  if (target in vault && vault[target].length) {
    try {
      balance += vault[target].map((a) => a.balance).reduce((a, b) => a + b, 0);
    } catch (e) {}
  }

  return { target, balance };
}
