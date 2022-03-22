import {
  ActionInterface,
  StateInterface,
  TransferLockedInterface
} from "../faces";
import { isAddress } from "../utils";

export default function TransferLocked(
  state: StateInterface,
  action: ActionInterface
): StateInterface {
  const input: TransferLockedInterface = action.input;
  const caller = action.caller;

  // check if there is a target and if it is a valid Arweave address
  const target = input.target;

  ContractAssert(!!target, "No target specified");
  ContractAssert(
    isAddress(target),
    `The given target is not a valid Arweave address: ${input.target}`
  );

  // check if quantity  is an integer
  const qty = +input.qty;

  ContractAssert(
    Number.isInteger(qty),
    'Invalid value for "qty". Must be an integer'
  );

  // check if qty is more than 0
  ContractAssert(qty > 0, "Transfer qty is too low");

  // check if lockLength is an integer
  const lockLength = +input.lockLength;
  const settings: Map<string, any> = new Map(state.settings);

  ContractAssert(
    Number.isInteger(lockLength),
    'Invalid value for "lockLength". Must be an integer'
  );

  // validate lock length
  ContractAssert(
    lockLength < settings.get("lockMinLength") &&
      lockLength > settings.get("lockMaxLength"),
    `Input for "lockLength" is out of range, must be between ${settings.get(
      "lockMinLength"
    )} and ${settings.get("lockMaxLength")}`
  );

  // check balance
  const balances = state.balances;
  const balance = balances[caller];

  ContractAssert(!isNaN(balance) && balance >= qty, "Not enough balance");

  // do the transfer
  balances[caller] -= qty;

  const start = +SmartWeave.block.height;
  const end = start + lockLength;

  const vault = state.vault;

  if (target in vault) {
    // wallet already exists in state, add new tokens
    vault[target].push({
      balance: qty,
      end,
      start
    });
  } else {
    // wallet is new, set starting balance
    vault[target] = [
      {
        balance: qty,
        end,
        start
      }
    ];
  }

  return state;
}
