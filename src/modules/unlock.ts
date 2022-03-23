import { ActionInterface, StateInterface } from "../faces";

export default function Unlock(state: StateInterface, action: ActionInterface) {
  const caller = action.caller;

  const vault = state.vault;
  const balances = state.balances;

  // return if user does not have a vault
  if (!(caller in vault) || vault[caller].length === 0) return state;

  // do unlock
  let i = vault[caller].length;

  while (i--) {
    const locked = vault[caller][i];

    if (+SmartWeave.block.height >= locked.end) {
      if (caller in balances && typeof balances[caller] === "number") {
        // add to existing balance
        balances[caller] += locked.balance;
      } else {
        // create balance
        balances[caller] = locked.balance;
      }

      // remove from vault
      vault[caller].splice(i, 1);
    }
  }

  return state;
}
