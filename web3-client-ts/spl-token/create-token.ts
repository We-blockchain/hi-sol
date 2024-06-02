/**
# spl-token create-token
Creating token 9sxPAwGUEa5UyUZeGKog7QW5MhwihKwobQRquoHrJ3dJ under program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA

Address:  9sxPAwGUEa5UyUZeGKog7QW5MhwihKwobQRquoHrJ3dJ
Decimals:  9

Signature: Fzw12EX1mYoivbboXQTK2WiEdGaT8BvXSpDLWKLD9HvvwTW8XqCqBteeEdsiSVUEUMHrHEjEoE1kprqoHYmY9T5
 */
import web3, { Keypair, LAMPORTS_PER_SOL, SystemProgram, Transaction } from '@solana/web3.js';
import helpers from '@solana-developers/helpers';
import * as spl from '@solana/spl-token';

var rpc = web3.clusterApiUrl("devnet");
var conn = new web3.Connection(rpc);

var wallet = await helpers.getKeypairFromFile("~/.config/solana/id.json");
var mint_account = Keypair.generate();
var decimals = 9;
var programId = spl.TOKEN_2022_PROGRAM_ID;
// var programId = spl.TOKEN_PROGRAM_ID;

var MINT_SIZE = 82; // MINT_SIZE, must be 82, otherwise invalid account data for instruction
var lamports = await conn.getMinimumBalanceForRentExemption(MINT_SIZE);
var tx = new Transaction().add(
    // 1. Creating mint account
    SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: mint_account.publicKey,
        space: MINT_SIZE,
        // lamports: 0.01 * LAMPORTS_PER_SOL,
        lamports: lamports,
        programId: programId,
    }),
    // 2. Init mint account
    spl.createInitializeMint2Instruction(
        mint_account.publicKey, decimals, wallet.publicKey, wallet.publicKey, programId
    ),
);

console.log(`Creating token ${mint_account.publicKey.toBase58()} under program ${programId}`);
var signature = await web3.sendAndConfirmTransaction(conn, tx, [wallet, mint_account]); // mint_account 在曲线上，有私钥，所以创建该账户需要签名，转移所有权给代币程序
console.log(`Address:  ${mint_account.publicKey.toBase58()}`);
console.log(`Decimals:  ${decimals}`);
console.log(`Signature:  ${signature}`);

// Creating and Init mint account
// await spl.createMint(conn, wallet, wallet.publicKey, wallet.publicKey, decimals, mint_account);