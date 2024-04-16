import web3 from "@solana/web3.js";
import { airdrop, showBalances, transfer } from "./utils";

var rpc = "http://localhost:8899";
// rpc = web3.clusterApiUrl("mainnet-beta");
let conn = new web3.Connection(rpc);

let from = web3.Keypair.generate();
let to = web3.Keypair.generate();
await airdrop(conn, from.publicKey, 100);
await showBalances(conn, from.publicKey, to.publicKey);
console.log("转账中...");
await transfer(conn, from, to.publicKey, 1);
console.log("转账结果");
await showBalances(conn, from.publicKey, to.publicKey);