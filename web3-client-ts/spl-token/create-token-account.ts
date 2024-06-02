/**
# spl-token create-account 9sxPAwGUEa5UyUZeGKog7QW5MhwihKwobQRquoHrJ3dJ
Creating account AWp5DhTkmCMrp47Dvem8ZymBcAADnDeXNv6wV6LpgR13

Signature: Pt4MaZTCzMTxuxDx8aokB22A5QN6ybL1mCTBoDUV8MfarvAaJLdCEXRvBh3QAmZGSu72x65pqKU6YVfWDsbukJY
 */
import web3, { Keypair, PublicKey, Transaction } from '@solana/web3.js';
import helpers from '@solana-developers/helpers';
import * as spl from '@solana/spl-token';

var rpc = web3.clusterApiUrl("devnet");
var conn = new web3.Connection(rpc);

var payer = await helpers.getKeypairFromFile("~/.config/solana/id.json");
var mint_account = new PublicKey("E4cyPv4ATUUaJDpXXS6GQDjidbqNoGUVky2igdTUkSGV");
// 代币账户的所有者
var owner_token_account = (Keypair.generate()).publicKey;
// var owner_token_account = (await helpers.getKeypairFromFile("./AtPhRzoFpbjUAbHr2PBs4uvKfC9oFHq39mUTLRu6QaLS.json")).publicKey;
// var owner_token_account = new PublicKey("11111111111111111111111111111111");
var programId = spl.TOKEN_2022_PROGRAM_ID;

// 计算所有者对应的关联代币账户，该账户是关联程序派生的PDA地址
var [token_account] = PublicKey.findProgramAddressSync(
    [owner_token_account.toBuffer(), programId.toBuffer(), mint_account.toBuffer()],
    spl.ASSOCIATED_TOKEN_PROGRAM_ID
);
console.log(`Creating account ${token_account}`);
var tx = new Transaction().add(
    spl.createAssociatedTokenAccountInstruction(
        payer.publicKey, // fee payer
        token_account,
        owner_token_account,
        mint_account,
        programId,
        spl.ASSOCIATED_TOKEN_PROGRAM_ID
    ),
);
var signature = await web3.sendAndConfirmTransaction(conn, tx, [payer]); // token_account 不在曲线上，没有对应的私钥，而且PDA地址只能由对应的所有者程序在链上创建（此处为关联程序）
console.log(`Signature:  ${signature}`);

// var token_account = await spl.createAssociatedTokenAccount(conn, payer, mint_account, owner, {}, programId, spl.ASSOCIATED_TOKEN_PROGRAM_ID);
// console.log(`Creatined account ${token_account}`);