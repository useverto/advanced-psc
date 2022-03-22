import { ActionInterface, StateInterface } from "./faces";

import Transfer from "./modules/transfer";
import TransferLocked from "./modules/transferLocked";
import Balance from "./modules/balance";
import UnlockedBalance from "./modules/unlockedBalance";

export async function handle(state: StateInterface, action: ActionInterface) {
  // parse function
  switch (action.input.function) {
    case "transfer":
      return { state: Transfer(state, action) };

    case "transferLocked":
      return { state: TransferLocked(state, action) };

    case "balance":
      return { result: Balance(state, action) };

    case "unlockedBalance":
      return { result: UnlockedBalance(state, action) };

    // FCP

    default:
      throw new ContractError(`Invalid function: "${action.input.function}"`);
  }
}
