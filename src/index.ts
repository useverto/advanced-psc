import { ActionInterface, HandleReturn, StateInterface } from "./faces";

import Transfer from "./modules/transfer";
import TransferLocked from "./modules/transferLocked";

export function handle(
  state: StateInterface,
  action: ActionInterface
): HandleReturn {
  // parse function
  switch (action.input.function) {
    case "transfer":
      return { state: Transfer(state, action) };

    case "transferLocked":
      return { state: TransferLocked(state, action) };

    default:
      throw new ContractError(`Invalid function: "${action.input.function}"`);
  }
}
