import web3, { Keypair } from "@solana/web3.js";
import * as bip39 from "bip39";

var rpc = web3.clusterApiUrl("mainnet-beta");
var rpc = "http://localhost:8899";
let connection = new web3.Connection(rpc);

// See: https://yihau.github.io/solana-web3-demo/tour/create-keypair.html
const mnemonic = bip39.generateMnemonic();
const pwd = "";
console.log({ mnemonic, pwd });

const seed = bip39.mnemonicToSeedSync(mnemonic, pwd); // (mnemonic, password)
let keypair = Keypair.fromSeed(seed.slice(0, 32));
let address: string = keypair.publicKey.toBase58();
console.log({ seed, address });

let id = connection.onAccountChange(keypair.publicKey, (accountInfo) => {
    if (accountInfo) {
        const lamports = accountInfo.lamports;
        const balanceInSol = lamports / web3.LAMPORTS_PER_SOL; // 转换为 SOL
        console.log(`账户余额更新: ${balanceInSol} SOL`);
        connection.removeAccountChangeListener(id);
    }
});

await connection.requestAirdrop(keypair.publicKey, 100 * web3.LAMPORTS_PER_SOL);