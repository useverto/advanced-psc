import {
  ActionInterface,
  StateInterface,
  IncreaseVaultInterface
} from "../faces";
import { RESTRICT_TO_INTEGER } from "../utils";

export default function IncreaseVault(
  state: StateInterface,
  action: ActionInterface
) {
  const input: IncreaseVaultInterface = action.input;
  const caller = action.caller;

  // check if lock length is an integer
  const lockLength = input.lockLength;
  const settings: Map<string, any> = new Map(state.settings);

  ContractAssert(
    Number.isInteger(lockLength) || !RESTRICT_TO_INTEGER,
    'Invalid value for "lockLength". Must be an integer'
  );

  // validate lock lenght
  ContractAssert(
    lockLength < settings.get("lockMinLength") &&
      lockLength > settings.get("lockMaxLength"),
    `Input for "lockLength" is out of range, must be between ${settings.get(
      "lockMinLength"
    )} and ${settings.get("lockMaxLength")}`
  );

  // check if caller has a vault
  const id = input.id;
  const vault = state.vault;

  ContractAssert(caller in vault, "Caller does not have a vault");

  // check vault id
  ContractAssert(!!vault[caller][id], "Invalid vault ID");

  // check if vault has already ended
  ContractAssert(
    +SmartWeave.block.height < vault[caller][id].end,
    "This vault has ended"
  );

  // increase
  vault[caller][id].end = +SmartWeave.block.height + lockLength;

  return state;
}
