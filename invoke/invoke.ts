import web3, { SystemProgram } from "@solana/web3.js";

var rpc = web3.clusterApiUrl("mainnet-beta");
var rpc = "http://localhost:8899";
let connection = new web3.Connection(rpc);
let program_id = "AGPTadm3zoNBYpmr3xDnFQNMwHZkmmqjrmSGz6N8eQw";

let secretKey = Uint8Array.from([98, 189, 226, 198, 2, 192, 112, 255, 161, 24, 248, 194, 178, 197, 220, 188, 245, 253, 171, 123, 10, 44, 73, 7, 188, 176, 19, 152, 239, 189, 245, 182]);
let feePayer = web3.Keypair.fromSeed(secretKey);
let keypair = web3.Keypair.generate();

let transaction = new web3.Transaction();
transaction.add(new web3.TransactionInstruction({
    keys: [
        {
            pubkey: feePayer.publicKey,
            isSigner: true,
            isWritable: true,
        },
        {
            pubkey: keypair.publicKey,
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: SystemProgram.programId,
            isSigner: false,
            isWritable: false,
        },
    ],
    programId: new web3.PublicKey(program_id),
    // # 计算给定帐户数据字段长度的免租最小值
    // $ solana rent 0
    // $ solana rent system
    // Rent-exempt minimum: 0.00089088 SOL
    data: Buffer.from(new TextEncoder().encode("0.00089088")), 
    // data: Buffer.from(new TextEncoder().encode(`${ 0.00089088 - 0.00000001 }`)), // 交易模拟失败：交易导致账户（1）租金资金不足
}));

// let TRANSACTION_SIGNATURE = await web3.sendAndConfirmTransaction(connection, transaction, [feePayer]);
let TRANSACTION_SIGNATURE = await connection.sendTransaction(transaction, [feePayer]); // you can try to remove and see what will happen
console.log({ TRANSACTION_SIGNATURE });

// 等待交易被确认
let latestBH = await connection.getLatestBlockhash('confirmed');
let confirmation = await connection.confirmTransaction({
    blockhash: latestBH.blockhash,
    lastValidBlockHeight: latestBH.lastValidBlockHeight,
    signature: TRANSACTION_SIGNATURE
}, 'confirmed'); // 等待交易被确认
// }, 'finalized'); // 等待交易已完成
// console.log({ confirmation });

// 查询交易，查看日志等细节
let txResult = await connection.getTransaction(TRANSACTION_SIGNATURE, {
    commitment: 'confirmed', 
    maxSupportedTransactionVersion: 1
});
console.log({ txResult });

let balance = await connection.getBalance(keypair.publicKey);
console.log({ balance });