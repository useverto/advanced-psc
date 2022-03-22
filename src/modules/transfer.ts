import { ActionInterface, StateInterface } from "../faces";
import { isAddress } from "../utils";

export default function Transfer(
  state: StateInterface,
  action: ActionInterface
): StateInterface {
  const input = action.input;

  // check if there is a target and if it is a valid Arweave address
  const target = input.target;

  ContractAssert(!!target, "No target specified");
  ContractAssert(
    isAddress(target),
    `The given target is not a valid Arweave address: ${input.target}`
  );

  // check if target is the caller
  const caller = action.caller;

  ContractAssert(caller !== target, "User cannot transfer to themselves");

  // check if quantity is an integer
  const qty = input.qty;

  ContractAssert(
    Number.isInteger(qty),
    'Invalid value for "qty". Must be an integer'
  );

  // check if qty is more than 0
  ContractAssert(qty > 0, "Transfer qty is too low");

  // check if the caller owns a balance & if it owns enough tokens
  const balances = state.balances;

  ContractAssert(caller in balances, "Caller doesn't own any DAO balance");
  ContractAssert(
    balances[caller] >= qty,
    `Caller balance not high enough to send ${qty} token(s)`
  );

  // Lower the token balance of the caller
  balances[caller] -= qty;

  if (target in balances) {
    // wallet already exists in state, add new tokens
    balances[target] += qty;
  } else {
    // wallet is new, set starting balance
    balances[target] = qty;
  }

  return state;
}
