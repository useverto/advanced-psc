import { ActionInterface, StateInterface } from "./faces";

import Transfer from "./modules/transfer";
import TransferLocked from "./modules/transferLocked";

export async function handle(state: StateInterface, action: ActionInterface) {
  // parse function
  switch (action.input.function) {
    case "transfer":
      return { state: Transfer(state, action) };

    case "transferLocked":
      return { state: TransferLocked(state, action) };

    // FCP

    default:
      throw new ContractError(`Invalid function: "${action.input.function}"`);
  }
}
