import web3 from "@solana/web3.js";
import * as bip39 from "bip39";
import nacl from 'tweetnacl';

var rpc = web3.clusterApiUrl("mainnet-beta");
var rpc = "http://localhost:8899";
let connection = new web3.Connection(rpc);

// See: https://yihau.github.io/solana-web3-demo/tour/create-keypair.html
const mnemonic = bip39.generateMnemonic(); // 生成随机助记词
const pwd = ""; // 助记词密码
console.log({ mnemonic, pwd });

// 从助记词创建私钥种子
let bip39Seed: Buffer = bip39.mnemonicToSeedSync(mnemonic, pwd); // (mnemonic, password)
// bip39Seed = Buffer.from(nacl.randomBytes(32)); // Solana种子可以从32位随机字节创建，助记词不是必须的
let keypair = web3.Keypair.fromSeed(bip39Seed.slice(0, 32));
let address: string = keypair.publicKey.toBase58();
// Solana只识别从Keypair.fromSeed(Uint8Array[..32])得到的secretKey, bip39Seed只有前32个字节对Solana有效
console.log({ bip39Seed, solanaSeed: keypair.secretKey, address });
// 不同密码会生成不同的种子
let differentSeed: Buffer = bip39.mnemonicToSeedSync(mnemonic, "different password");
let differentKeypair = web3.Keypair.fromSeed(differentSeed.slice(0, 32));
let differentAddress: string = differentKeypair.publicKey.toBase58();
console.log({ differentSeed, differentAddress });

let id = connection.onAccountChange(keypair.publicKey, (accountInfo) => {
    if (accountInfo) {
        const lamports = accountInfo.lamports;
        const balanceInSol = lamports / web3.LAMPORTS_PER_SOL; // 转换为 SOL
        console.log(`账户余额更新: ${balanceInSol} SOL`);
        connection.removeAccountChangeListener(id);
    }
});

await connection.requestAirdrop(keypair.publicKey, 100 * web3.LAMPORTS_PER_SOL);