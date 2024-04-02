import web3 from "@solana/web3.js";

let rpc = web3.clusterApiUrl("mainnet-beta"); // 替换为适合您的网络的 RPC 地址，如 https://api.mainnet-beta.solana.com
let connection = new web3.Connection(rpc);
let publicKey = new web3.PublicKey("CakcnaRDHka2gXyfbEd2d3xsvkJkqsLw2akB3zsN1D2S");
let balance = await connection.getBalance(publicKey) / web3.LAMPORTS_PER_SOL; // 将 lamports 转换为 SOL
console.log(`地址 ${publicKey} 账户余额: ${balance} SOL`);