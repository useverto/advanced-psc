import {
  ActionInterface,
  StateInterface,
  ProposeInterface,
  VoteInterface
} from "../faces";
import { isAddress, RESTRICT_TO_INTEGER } from "../utils";

export default function Propose(
  state: StateInterface,
  action: ActionInterface
) {
  const input: ProposeInterface = action.input;
  const caller = action.caller;

  const note = input.note;
  const balances = state.balances;
  const settings: Map<string, any> = new Map(state.settings);

  // check note format
  ContractAssert(typeof note === "string", "Note format not recognized");

  const vault = state.vault;

  // check if caller has locked balances
  ContractAssert(caller in vault, "Caller needs to have locked balances.");

  // check if caller has balances
  ContractAssert(
    !!vault[caller] && !!vault[caller].filter((a) => a.balance > 0).length,
    "Caller doesn't have any locked balance"
  );

  // calcualte total weight
  let totalWeight = 0;
  const vaultValues = Object.values(vault);

  for (const locked of vaultValues) {
    for (const lockedItem of locked) {
      totalWeight += lockedItem.balance * (lockedItem.end - lockedItem.start);
    }
  }

  // create vote object
  const voteType = input.type;
  const votes = state.votes;

  let vote: VoteInterface = {
    status: "active",
    type: voteType,
    note,
    yays: 0,
    nays: 0,
    voted: [],
    start: +SmartWeave.block.height,
    totalWeight
  };

  // handle vote according to it's type
  if (voteType === "mint" || voteType === "mintLocked") {
    const recipient = input.recipient;

    ContractAssert(isAddress(input.recipient), "Recipient address is invalid");

    const qty = +input.qty;

    ContractAssert(
      Number.isInteger(qty) || !RESTRICT_TO_INTEGER,
      "Qty is not a valid address"
    );
    ContractAssert(qty > 0, "Qty is less than 0");

    let totalSupply = 0;
    const vaultValues = Object.values(vault);

    for (const vaultItem of vaultValues) {
      for (const locked of vaultItem) {
        totalSupply += locked.balance;
      }
    }

    const balancesValues = Object.values(balances);

    for (const addrBalance of balancesValues) {
      totalSupply += addrBalance;
    }

    ContractAssert(
      totalSupply + qty < Number.MAX_SAFE_INTEGER,
      "Qty is too large"
    );

    let lockLength = {};

    if (input.lockLength) {
      ContractAssert(
        Number.isInteger(input.lockLength),
        'Invalid value for "lockLength". Must be an integer'
      );

      // validate lock length
      ContractAssert(
        input.lockLength > settings.get("lockMinLength") &&
          input.lockLength < settings.get("lockMaxLength"),
        `Input for "lockLength" is out of range, must be between ${settings.get(
          "lockMinLength"
        )} and ${settings.get("lockMaxLength")}`
      );

      lockLength = { lockLength: input.lockLength };
    }

    Object.assign(
      vote,
      {
        recipient,
        qty: qty
      },
      lockLength
    );

    votes.push(vote);
  } else if (voteType === "burnVault") {
    const target = input.target;

    ContractAssert(isAddress(target), "Target address is not a valid address");

    Object.assign(vote, {
      target
    });

    votes.push(vote);
  } else if (voteType === "set") {
    ContractAssert(
      typeof input.key === "string",
      "Data type of key not supported"
    );

    // Validators
    if (
      input.key === "quorum" ||
      input.key === "support" ||
      input.key === "lockMinLength" ||
      input.key === "lockMaxLength"
    ) {
      input.value = +input.value;
    }

    ContractAssert(
      input.key !== "quorum" ||
        (!isNaN(input.value) && input.value >= 0.01 && input.value <= 0.99),
      "Quorum must be between 0.01 and 0.99"
    );
    ContractAssert(
      input.key !== "support" ||
        (!isNaN(input.value) && input.value >= 0.01 && input.value <= 0.99),
      "Quorum must be between 0.01 and 0.99"
    );
    ContractAssert(
      input.key !== "lockMinLength" ||
        (Number.isInteger(input.value) &&
          input.value >= 1 &&
          input.value < settings.get("lockMaxLength")),
      "lockMinLength cannot be less than 1 and cannot be equal or greater than lockMaxLength"
    );
    ContractAssert(
      input.key !== "lockMaxLength" ||
        (Number.isInteger(input.value) &&
          input.value > settings.get("lockMinLength")),
      "lockMaxLength cannot be less than or equal to lockMinLength"
    );

    if (input.key === "role") {
      const recipient = input.recipient;

      ContractAssert(isAddress(recipient), "Invalid recipient address");

      Object.assign(vote, {
        key: input.key,
        value: input.value,
        recipient
      });
    } else {
      Object.assign(vote, {
        key: input.key,
        value: input.value
      });
    }

    votes.push(vote);
  } else if (voteType === "indicative") {
    votes.push(vote);
  } else {
    throw new ContractError("Invalid vote type");
  }

  return state;
}
