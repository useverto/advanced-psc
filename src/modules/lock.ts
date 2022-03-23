import { ActionInterface, StateInterface, LockInterface } from "../faces";
import { RESTRICT_TO_INTEGER } from "../utils";

export default function Lock(state: StateInterface, action: ActionInterface) {
  const input: LockInterface = action.input;
  const caller = action.caller;

  // check if quantity  is an integer
  const qty = +input.qty;

  ContractAssert(
    Number.isInteger(qty) || !RESTRICT_TO_INTEGER,
    'Invalid value for "qty". Must be an integer'
  );

  // check if qty is more than 0
  ContractAssert(qty > 0, "Lock qty is too low");

  // check if lockLength is an integer
  const lockLength = +input.lockLength;
  const settings: Map<string, any> = new Map(state.settings);

  ContractAssert(
    Number.isInteger(lockLength),
    'Invalid value for "lockLength". Must be an integer'
  );

  // validate lock length
  ContractAssert(
    lockLength > settings.get("lockMinLength") &&
      lockLength < settings.get("lockMaxLength"),
    `Input for "lockLength" is out of range, must be between ${settings.get(
      "lockMinLength"
    )} and ${settings.get("lockMaxLength")}`
  );

  // check balance
  const balances = state.balances;
  const balance = balances[caller];

  ContractAssert(!isNaN(balance) && balance >= qty, "Not enough balance");

  // do the locking
  balances[caller] -= qty;

  const start = +SmartWeave.block.height;
  const end = start + lockLength;

  const vault = state.vault;

  if (caller in vault) {
    // Wallet already exists in state, add new tokens
    vault[caller].push({
      balance: qty,
      end,
      start
    });
  } else {
    // Wallet is new, set starting balance
    vault[caller] = [
      {
        balance: qty,
        end,
        start
      }
    ];
  }

  return state;
}
