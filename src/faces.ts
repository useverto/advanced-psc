// contract state interface
export interface StateInterface {
  name: string;
  ticker: string;

  balances: BalancesInterface;
  vault: VaultInterface;

  votes: VoteInterface[];
  roles: RoleInterface;

  settings: [string, any][];

  invocations: string[];
  foreignCalls: ForeignCallInterface[];
}

// interaction interface
export interface ActionInterface {
  input: any;
  caller: string;
}

export interface RoleInterface {
  [key: string]: string;
}

export interface BalancesInterface {
  [key: string]: number;
}

export interface VaultInterface {
  [key: string]: VaultParamsInterface[];
}

export interface VaultParamsInterface {
  balance: number;
  start: number;
  end: number;
}

export interface VoteInterface {
  status?: VoteStatus;
  type?: VoteType;
  id?: number;
  totalWeight?: number;
  recipient?: string;
  target?: string;
  qty?: number;
  key?: string;
  value?: any;
  note?: string;
  yays?: number;
  nays?: number;
  voted?: string[];
  start?: number;
  lockLength?: number;
}

// inputs

export interface TransferInterface {
  function: "transfer";
  target: string;
  qty: number;
}

export interface TransferLockedInterface {
  function: "transferLocked";
  target: string;
  qty: number;
  lockLength: number;
}

export interface ResultInterface {
  target: string;
  balance: number;
  role: string;
}

export interface BalanceInterface {
  function: "balance";
  target?: string;
}

export interface UnlockedBalanceInterface extends BalanceInterface {}

export interface LockInterface {
  function: "lock";
  qty: number;
  lockLength: number;
}

export interface IncreaseVaultInterface {
  function: "increaseVault";
  id: string;
  lockLength: number;
}

export interface VaultBalanceInterface extends BalanceInterface {}

export interface ProposeInterface {
  function: "propose";
  note: string;
  type: VoteType;
  qty: number;
  recipient: string;
  target: string;
  lockLength: number;
  key: string;
  value: number;
}

export interface VoteActionInterface {
  function: "vote";
  id: string;
  cast: string;
}

export interface FinalizeInterface {
  function: "finalize";
  id: string;
}

// FCP inputs

export interface InvokeInterface {
  function: "invoke";
  foreignContract: string;
  invocation: InvocationInterface;
}

export interface ReadOutboxInterface {
  function: "readOutbox";
  contract: string;
  id: string;
}

// FCP state interfaces

export interface ForeignCallInterface {
  txID: string;
  contract: string;
  input: InvocationInterface;
}

export interface InvocationInterface {
  function: string;
  [key: string | number]: any;
}

// vote statuses
export type VoteStatus = "active" | "quorumFailed" | "passed" | "failed";

// vote types
export type VoteType =
  | "mint"
  | "mintLocked"
  | "burnVault"
  | "indicative"
  | "set";
