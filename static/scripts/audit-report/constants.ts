export enum ChainScan {
  Ethereum = "etherscan.io",
  Gnosis = "gnosisscan.io"
}

export enum Chain {
  Ethereum = "Ethereum",
  Gnosis = "Gnosis"
}

export const NULL_ID = 0;
export const NULL_HASH = "0x0000000000000000000000000000000000000000";
export const DatabaseName = "file_cache";

// hardcoded values
export const API_KEYS = {
  [Chain.Ethereum]: [
    "35G6PRE7U54QWZMXYGUSI3YWU27TP2TTBK"
  ],
  [Chain.Gnosis]: [
    "R75N38X1Y5KP8CRPPDWBRT3EM5VDJ73MUK"
  ],
};

export const RPC_URLS = {
  [Chain.Ethereum]: [
    "https://rpc.builder0x69.io",
    "https://eth.meowrpc.com",
  ],
  [Chain.Gnosis]: [
    "https://rpc.ankr.com/gnosis",
  ],
}