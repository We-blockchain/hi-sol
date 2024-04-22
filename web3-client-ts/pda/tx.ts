import web3, { Keypair, PublicKey, SystemProgram, TransactionInstruction } from "@solana/web3.js";
import helpers from "@solana-developers/helpers";
import { airdrop } from "../examples/utils";

var rpc = "http://localhost:8899" || web3.clusterApiUrl("mainnet-beta");
var conn = new web3.Connection(rpc);
var feePayer = await helpers.getKeypairFromFile("~/.config/solana/id.json");
var newbie = Keypair.generate();
var progarm = await helpers.getKeypairFromFile("../../target/deploy/pda-keypair.json");

/**
    程序派生地址/Program derived address(PDA) 与普通地址相比具有以下区别：

    不在ed25519曲线上
    使用程序进行签名，而不是使用私钥

    注意: PDA账户只能在程序上创建，地址可以在客户端创建。（因为SystemProgram.createAccount指令需要账户的签名）
 */
let [pda, bump] = PublicKey.findProgramAddressSync([Buffer.from("PDA-seed")], progarm.publicKey);
console.log(`bump: ${bump}, pubkey: ${pda.toBase58()}`);
// solscan 可以查看到该地址不在曲线上，isOnCurve：false
// 曲线外地址是指任何没有对应私钥的地址
console.log("Explorer:", `https://solscan.io/account/${pda.toBase58()}?cluster=${rpc}`);

if (await conn.getBalance(pda) < 100) {
    await airdrop(conn, pda, 1000);
}

// 演示如何转移 PDA 账户的 SOL 代币给 newbie
let transaction = new web3.Transaction().add(
    new TransactionInstruction({
        programId: progarm.publicKey,
        keys: [
            {
                pubkey: pda,
                isSigner: false,
                isWritable: true,
            },
            {
                pubkey: newbie.publicKey,
                isSigner: false,
                isWritable: true,
            },
            {
                pubkey: SystemProgram.programId,
                isSigner: false,
                isWritable: false,
            },
        ],
        data: Buffer.from([]),
    })
);

let signature = await web3.sendAndConfirmTransaction(conn, transaction, [feePayer]);
console.log("signature:", signature);
console.log("Query:", `solana confirm -v ${signature}`);
