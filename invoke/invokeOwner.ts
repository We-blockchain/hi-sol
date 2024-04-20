import web3 from "@solana/web3.js";
// 将账户 BDpgZWLscJxaM97VRAG3Z937jTvu2DA67GACavCFuQci 的所有权转移给程序 AGPTadm3zoNBYpmr3xDnFQNMwHZkmmqjrmSGz6N8eQw
// 可能会因为该账户有余额而失败
import "./createAccount";

var rpc = web3.clusterApiUrl("mainnet-beta");
var rpc = "http://localhost:8899";
let connection = new web3.Connection(rpc);
let program_id = "AGPTadm3zoNBYpmr3xDnFQNMwHZkmmqjrmSGz6N8eQw";

let feePayer = web3.Keypair.fromSeed(Uint8Array.from([98, 189, 226, 198, 2, 192, 112, 255, 161, 24, 248, 194, 178, 197, 220, 188, 245, 253, 171, 123, 10, 44, 73, 7, 188, 176, 19, 152, 239, 189, 245, 182]));
/**
$ # 查询账户
$ solana account BDpgZWLscJxaM97VRAG3Z937jTvu2DA67GACavCFuQci

Public Key: BDpgZWLscJxaM97VRAG3Z937jTvu2DA67GACavCFuQci
Balance: 100 SOL
Owner: AGPTadm3zoNBYpmr3xDnFQNMwHZkmmqjrmSGz6N8eQw  <-- 注意这里的 owner 是 program_id，通过 createAccount.ts 设置的
Executable: false
Rent Epoch: 18446744073709551615
 */
let ownerAccount = web3.Keypair.fromSecretKey(Uint8Array.from([36, 181, 163, 231, 247, 151, 63, 120, 236, 30, 161, 214, 213, 11, 192, 180, 97, 197, 190, 154, 25, 234, 13, 218, 204, 2, 40, 54, 77, 3, 101, 233, 151, 221, 192, 214, 50, 137, 113, 250, 124, 188, 22, 169, 41, 116, 19, 71, 250, 183, 78, 105, 167, 167, 206, 192, 101, 71, 117, 220, 7, 156, 225, 243]));
let to = web3.Keypair.generate();

let transaction = new web3.Transaction();
transaction.add(new web3.TransactionInstruction({
    keys: [
        {
            pubkey: ownerAccount.publicKey,
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: to.publicKey,
            isSigner: false,
            isWritable: true,
        },
        // 要跨程序调用调用系统指令，必须传入系统程序账户
        {
            pubkey: web3.SystemProgram.programId,
            isSigner: false,
            isWritable: false,
        },
    ],
    programId: new web3.PublicKey(program_id),
    data: Buffer.from(new TextEncoder().encode("1"))
}));

// let TRANSACTION_SIGNATURE = await web3.sendAndConfirmTransaction(connection, transaction, [feePayer]);
// 如果程序拥有账户，那么程序不需要签名就可以转移代币
// 当然，前提是 isWritable 必须为 true，否则报错：Error processing Instruction 0: instruction changed the balance of a read-only account
let TRANSACTION_SIGNATURE = await connection.sendTransaction(transaction, [feePayer, /*ownerAccount*/]);
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