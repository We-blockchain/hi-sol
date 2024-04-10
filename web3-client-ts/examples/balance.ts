import web3 from "@solana/web3.js";

let rpc = "http://127.0.0.1:8899"; // 替换为适合您的网络的 RPC 地址，如 https://api.mainnet-beta.solana.com
let connection = new web3.Connection(rpc);
let publicKey = new web3.PublicKey("HZgSTq2MyKFp5NFtVzXVKQyA1pm1f1m4tX4XNkoAc8AB");
let balance = await connection.getBalance(publicKey) / web3.LAMPORTS_PER_SOL; // 将 lamports 转换为 SOL
console.log(`地址 ${publicKey} 账户余额: ${balance} SOL`);
