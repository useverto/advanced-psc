import {
  ActionInterface,
  UnlockedBalanceInterface,
  StateInterface
} from "../faces";

export default function UnlockedBalance(
  state: StateInterface,
  action: ActionInterface
) {
  const caller = action.caller;

  const input: UnlockedBalanceInterface = action.input;
  const target = input.target || caller;

  ContractAssert(
    /[a-z0-9_-]{43}/i.test(target),
    "Caller did not supply a valid target."
  );

  const balances = state.balances;
  let balance = 0;

  if (target in balances) {
    balance = balances[target];
  }

  return { target, balance };
}
