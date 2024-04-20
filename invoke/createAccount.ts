import web3, { LAMPORTS_PER_SOL, SystemProgram, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import { airdrop } from "./utils";

var rpc = web3.clusterApiUrl("mainnet-beta");
var rpc = "http://127.0.0.1:8899"; // 替换为适合您的网络的 RPC 地址，如 https://api.mainnet-beta.solana.com
let connection = new web3.Connection(rpc);
let secretKey = Uint8Array.from([98, 189, 226, 198, 2, 192, 112, 255, 161, 24, 248, 194, 178, 197, 220, 188, 245, 253, 171, 123, 10, 44, 73, 7, 188, 176, 19, 152, 239, 189, 245, 182]);
let feePayer = web3.Keypair.fromSeed(secretKey);
let fromKeypair = web3.Keypair.generate();
let newAccountKeypair = web3.Keypair.fromSecretKey(Uint8Array.from([36, 181, 163, 231, 247, 151, 63, 120, 236, 30, 161, 214, 213, 11, 192, 180, 97, 197, 190, 154, 25, 234, 13, 218, 204, 2, 40, 54, 77, 3, 101, 233, 151, 221, 192, 214, 50, 137, 113, 250, 124, 188, 22, 169, 41, 116, 19, 71, 250, 183, 78, 105, 167, 167, 206, 192, 101, 71, 117, 220, 7, 156, 225, 243]));
// let newAccountKeypair = web3.Keypair.generate();

// 将 BDpgZWLscJxaM97VRAG3Z937jTvu2DA67GACavCFuQci 的所有权转移给程序 AGPTadm3zoNBYpmr3xDnFQNMwHZkmmqjrmSGz6N8eQw
let owner = new web3.PublicKey("AGPTadm3zoNBYpmr3xDnFQNMwHZkmmqjrmSGz6N8eQw");

let account = await connection.getAccountInfo(newAccountKeypair.publicKey);
if (account) {
    if (!account.owner.equals(owner)) {
        throw new Error("账户已存在！");
    } else {
        console.warn("账户已属于目标程序！");
    }
} else {

    // await airdrop(connection, fromKeypair.publicKey, 1000);

    // 创建账户时，可以指定账户的所有者程序，默认是系统程序
    // 该账户余额必须是0，因为只有0余额的地址不存在于系统账本中，属于新账户
    // 你也不能对别人的0余额地址进行所有权转让，因为发送交易需要该账户的签名
    // 创建账户的同时必须存入租金，由 fromPubkey 存入，因此还需要 fromPubkey 的签名，当然，fromPubkey 也可以是 feePayer
    const createAccountTransaction = new Transaction().add(
        SystemProgram.createAccount({
            fromPubkey: feePayer.publicKey,
            // fromPubkey: fromKeypair.publicKey,
            newAccountPubkey: newAccountKeypair.publicKey,
            lamports: 100 * LAMPORTS_PER_SOL,
            space: 0,
            // 向一个 0 余额地址转账时，实际上是创建一个属于 SystemProgram 的账户，并存入租金
            // programId: SystemProgram.programId, // 11111111111111111111111111111111
            programId: owner,
        })
    );

    let signature = await sendAndConfirmTransaction(connection, createAccountTransaction, [
        feePayer,
        // fromKeypair,
        newAccountKeypair,
    ]);
    console.log({
        op: `创建账户 ${ newAccountKeypair.publicKey.toBase58() }`,
        signature
    });

}