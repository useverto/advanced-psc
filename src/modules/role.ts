import { ActionInterface, RoleInterface, StateInterface } from "../faces";
import { isAddress } from "../utils";

export default function Role(state: StateInterface, action: ActionInterface) {
  const input: RoleInterface = action.input;
  const caller = action.caller;
  const target = input.target || caller;

  ContractAssert(isAddress(target), "Invalid target address");

  const role = target in state.roles ? state.roles[target] : "";

  ContractAssert(!!role.trim().length, "Target doesn't have a role specified");

  return { target, role };
}
