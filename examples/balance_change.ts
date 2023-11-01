import web3 from "@solana/web3.js";

let rpc = `http://127.0.0.1:8899`; // 启动测试验证器，solana-test-validator JSON RPC URL
let connection = new web3.Connection(rpc);
let publicKey = new web3.PublicKey("FwNp7pJdiV1NqMP5ArbcP7z35ShqLAMZ7WtkumQHEUNC"); // 通过 $ solana address 查询到的钱包地址
let balance = await connection.getBalance(publicKey) / 1000000000; // 将 lamports 转换为 SOL
console.log(`地址 ${publicKey} 账户余额: ${balance} SOL`);

// 通过 $ solana airdrop 100 进行空投
connection.onAccountChange(publicKey, (accountInfo) => {
    if (accountInfo) {
        const lamports = accountInfo.lamports;
        const balanceInSol = lamports / 1000000000; // 转换为 SOL
        console.log(`账户余额更新: ${balanceInSol} SOL`);
    }
});
