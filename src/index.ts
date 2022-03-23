import { ActionInterface, StateInterface } from "./faces";

import Transfer from "./modules/transfer";
import TransferLocked from "./modules/transferLocked";
import Balance from "./modules/balance";
import UnlockedBalance from "./modules/unlockedBalance";
import Lock from "./modules/lock";
import ReadOutbox from "./modules/readOutbox";
import Invoke from "./modules/invoke";
import IncreaseVault from "./modules/increaseVault";
import Unlock from "./modules/unlock";

export async function handle(state: StateInterface, action: ActionInterface) {
  // parse function
  switch (action.input.function) {
    // transfering tokens
    case "transfer":
      return { state: Transfer(state, action) };

    case "transferLocked":
      return { state: TransferLocked(state, action) };

    // getting balance
    case "balance":
      return { result: Balance(state, action) };

    case "unlockedBalance":
      return { result: UnlockedBalance(state, action) };

    // lock system
    case "lock":
      return { state: Lock(state, action) };

    case "increaseVault":
      return { state: IncreaseVault(state, action) };

    case "unlock":
      return { state: Unlock(state, action) };

    // FCP
    case "readOutbox":
      return { state: await ReadOutbox(state, action) };

    case "invoke":
      return { state: await Invoke(state, action) };

    default:
      throw new ContractError(`Invalid function: "${action.input.function}"`);
  }
}
