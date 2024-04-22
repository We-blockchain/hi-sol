import web3, { PublicKey, SystemProgram } from "@solana/web3.js";
import helpers from "@solana-developers/helpers";

var rpc = "http://localhost:8899" || web3.clusterApiUrl("mainnet-beta");
var conn = new web3.Connection(rpc);
var feePayer = await helpers.getKeypairFromFile("~/.config/solana/id.json");
var progarm = await helpers.getKeypairFromFile("../../target/deploy/pda-keypair.json");

/**
    程序派生地址/Program derived address(PDA) 与普通地址相比具有以下区别：

    不在ed25519曲线上
    使用程序进行签名，而不是使用私钥

    注意: PDA账户只能在程序上创建，地址可以在客户端创建。
 */
let [pda, bump] = PublicKey.findProgramAddressSync([Buffer.from("PDA-seed")], progarm.publicKey);
console.log(`bump: ${bump}, pubkey: ${pda.toBase58()}`);

// 演示修改一个尚未创建的 PDA 账户的 Owner
let space = 0;
let transaction = new web3.Transaction().add(
    SystemProgram.createAccount({
        fromPubkey: feePayer.publicKey,
        newAccountPubkey: pda,
        lamports: await conn.getMinimumBalanceForRentExemption(space),
        programId: progarm.publicKey,
        space: space,
    })
);

// error: Signature verification failed，因为 DPA 是没有私钥的，无法签名
// 所以 Solana Cook Book 才会说：PDA 账户只能在程序上创建，地址可以在客户端创建
// 因为只有程序才能提供该签名！
// See: https://solanacookbook.com/zh/references/accounts.html#如何创建pda
let signature = await web3.sendAndConfirmTransaction(conn, transaction, [feePayer]);
console.log("signature:", signature);
console.log("Query:", `solana confirm -v ${signature}`);