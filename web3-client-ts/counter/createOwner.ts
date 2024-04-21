import web3, { SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import helpers from "@solana-developers/helpers";

// var progarm = new web3.PublicKey("rrCz1sepDQfEBANWictp69Gkyw4pJiKEj7oRRVWuddj");
var progarm = await helpers.getKeypairFromFile("../../target/deploy/counter-keypair.json");
var owner = await helpers.getKeypairFromFile("./3DHRsdoXRZR6DMMhCsd7npska1GmcS9b5qhfw186nTJ2.json");
var feePayer = await helpers.getKeypairFromFile("~/.config/solana/id.json");
var rpc = "http://localhost:8899" || web3.clusterApiUrl("mainnet-beta");
var conn = new web3.Connection(rpc);

let space = 1;
let tx = new Transaction().add(
    SystemProgram.createAccount({
        fromPubkey: feePayer.publicKey,
        programId: progarm.publicKey,
        newAccountPubkey: owner.publicKey,
        space: space,
        lamports: await conn.getMinimumBalanceForRentExemption(space),
    })
);

let signature = await web3.sendAndConfirmTransaction(conn, tx, [feePayer, owner]);
console.log("Account created:", signature);
console.log("Query: solana account 3DHRsdoXRZR6DMMhCsd7npska1GmcS9b5qhfw186nTJ2");