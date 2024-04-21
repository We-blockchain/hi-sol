import web3, { Transaction, TransactionInstruction } from "@solana/web3.js";
import helpers from "@solana-developers/helpers";

// var progarm = new web3.PublicKey("rrCz1sepDQfEBANWictp69Gkyw4pJiKEj7oRRVWuddj");
var progarm = await helpers.getKeypairFromFile("../../target/deploy/counter-keypair.json");
var owner = await helpers.getKeypairFromFile("./3DHRsdoXRZR6DMMhCsd7npska1GmcS9b5qhfw186nTJ2.json");
var feePayer = await helpers.getKeypairFromFile("~/.config/solana/id.json");
var rpc = "http://localhost:8899" || web3.clusterApiUrl("mainnet-beta");
var conn = new web3.Connection(rpc);

let tx = new Transaction().add(
    new TransactionInstruction({
        programId: progarm.publicKey,
        keys: [
            {
                pubkey: owner.publicKey,
                isSigner: false,
                isWritable: true,
            },
        ],
        data: Buffer.from([100]), // 多次运行可以观察到 u8 溢出
    }),
);

let signature = await web3.sendAndConfirmTransaction(conn, tx, [feePayer]);
console.log("交易完成:", signature);
console.log(`Query: solana confirm -v ${signature}`);