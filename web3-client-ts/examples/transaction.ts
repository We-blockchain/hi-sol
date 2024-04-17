import web3 from "@solana/web3.js";

var rpc = web3.clusterApiUrl("mainnet-beta");
var rpc = "http://localhost:8899";
let connection = new web3.Connection(rpc);
let program_id = "GoBVPYUK5gYNmMen785Ug1yseUrwszP7kYGcG6xUz3yU";

let secretKey = Uint8Array.from([98, 189, 226, 198, 2, 192, 112, 255, 161, 24, 248, 194, 178, 197, 220, 188, 245, 253, 171, 123, 10, 44, 73, 7, 188, 176, 19, 152, 239, 189, 245, 182]);
let keypair = web3.Keypair.fromSeed(secretKey);

let address: string = keypair.publicKey.toBase58();
console.log({ address, program_id });

let transaction = new web3.Transaction();
transaction.add(new web3.TransactionInstruction({
    keys: [],
    programId: new web3.PublicKey(program_id),
    data: Buffer.from([1, 2, 3])
}));

// let TRANSACTION_SIGNATURE = await web3.sendAndConfirmTransaction(connection, transaction, [keypair]);
let TRANSACTION_SIGNATURE = await connection.sendTransaction(transaction, [keypair]);
console.log({ TRANSACTION_SIGNATURE });

let latestBH = await connection.getLatestBlockhash('confirmed');
let confirmation = await connection.confirmTransaction({
    blockhash: latestBH.blockhash,
    lastValidBlockHeight: latestBH.lastValidBlockHeight,
    signature: TRANSACTION_SIGNATURE
}, 'confirmed');
console.log({ confirmation });

let txResult = await connection.getTransaction(TRANSACTION_SIGNATURE, {
    commitment: 'confirmed', 
    maxSupportedTransactionVersion: 1
});
console.log({ txResult });