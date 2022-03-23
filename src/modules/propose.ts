import {
  ActionInterface,
  StateInterface,
  ProposeInterface,
  VoteInterface
} from "../faces";

export default function Propose(
  state: StateInterface,
  action: ActionInterface
) {
  const input: ProposeInterface = action.input;
  const caller = action.caller;

  const note = input.note;

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

  if (voteType === "mint" || voteType === "mintLocked") {
    const recipient = isArweaveAddress(input.recipient);
    const qty = +input.qty;

    if (!recipient) {
      throw new ContractError("No recipient specified");
    }

    if (!Number.isInteger(qty) || qty <= 0) {
      throw new ContractError(
        'Invalid value for "qty". Must be a positive integer.'
      );
    }

    let totalSupply = 0;
    const vaultValues = Object.values(vault);
    for (let i = 0, j = vaultValues.length; i < j; i++) {
      const locked = vaultValues[i];
      for (let j = 0, k = locked.length; j < k; j++) {
        totalSupply += locked[j].balance;
      }
    }
    const balancesValues = Object.values(balances);
    for (let i = 0, j = balancesValues.length; i < j; i++) {
      totalSupply += balancesValues[i];
    }

    if (totalSupply + qty > Number.MAX_SAFE_INTEGER) {
      throw new ContractError("Quantity too large.");
    }

    let lockLength = {};
    if (input.lockLength) {
      if (
        !Number.isInteger(input.lockLength) ||
        input.lockLength < settings.get("lockMinLength") ||
        input.lockLength > settings.get("lockMaxLength")
      ) {
        throw new ContractError(
          `lockLength is out of range. lockLength must be between ${settings.get(
            "lockMinLength"
          )} - ${settings.get("lockMaxLength")}.`
        );
      }

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
    const target: string = isArweaveAddress(input.target);

    if (!target || typeof target !== "string") {
      throw new ContractError("Target is required.");
    }

    Object.assign(vote, {
      target
    });

    votes.push(vote);
  } else if (voteType === "set") {
    if (typeof input.key !== "string") {
      throw new ContractError("Data type of key not supported.");
    }

    // Validators
    if (
      input.key === "quorum" ||
      input.key === "support" ||
      input.key === "lockMinLength" ||
      input.key === "lockMaxLength"
    ) {
      input.value = +input.value;
    }

    if (input.key === "quorum") {
      if (isNaN(input.value) || input.value < 0.01 || input.value > 0.99) {
        throw new ContractError("Quorum must be between 0.01 and 0.99.");
      }
    } else if (input.key === "support") {
      if (isNaN(input.value) || input.value < 0.01 || input.value > 0.99) {
        throw new ContractError("Support must be between 0.01 and 0.99.");
      }
    } else if (input.key === "lockMinLength") {
      if (
        !Number.isInteger(input.value) ||
        input.value < 1 ||
        input.value >= settings.get("lockMaxLength")
      ) {
        throw new ContractError(
          "lockMinLength cannot be less than 1 and cannot be equal or greater than lockMaxLength."
        );
      }
    } else if (input.key === "lockMaxLength") {
      if (
        !Number.isInteger(input.value) ||
        input.value <= settings.get("lockMinLength")
      ) {
        throw new ContractError(
          "lockMaxLength cannot be less than or equal to lockMinLength."
        );
      }
    }

    if (input.key === "role") {
      const recipient = isArweaveAddress(input.recipient);

      if (!recipient) {
        throw new ContractError("No recipient specified");
      }

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
    throw new ContractError("Invalid vote type.");
  }

  return state;
}
