import web3, { Keypair } from "@solana/web3.js";
import base58 from "bs58";
import nacl from "tweetnacl";

export type Address = web3.PublicKey | string | Uint8Array;

export function normalizeAddress(address: Address): web3.PublicKey {
    if (address instanceof web3.PublicKey) {
        return address;
    }
    return new web3.PublicKey(address);
}

export async function airdrop(conn: web3.Connection, address: Address, sol: number) {
    address = normalizeAddress(address);
    console.log(`[Airdrop] ${address.toBase58()}: ${sol} SOL`);
    await conn.requestAirdrop(address, sol * web3.LAMPORTS_PER_SOL);
    return new Promise((resolve) => {
        let id = conn.onAccountChange(address, (accountInfo) => {
            if (accountInfo) {
                const lamports = accountInfo.lamports;
                const balanceInSol = lamports / web3.LAMPORTS_PER_SOL; // 转换为 SOL
                console.log(`[Airdrop] ${address.toBase58()}: ${sol} SOL ok, balance: ${balanceInSol} SOL`);
                conn.removeAccountChangeListener(id);
                resolve(undefined);
            }
        });
    });
}

export async function transfer(conn: web3.Connection, from: Keypair, to: Address, sol: number) {
    to = normalizeAddress(to);
    let latestBlockhash = await conn.getLatestBlockhash();
    let transaction = new web3.Transaction({
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        feePayer: from.publicKey,
    }).add(web3.SystemProgram.transfer({
        fromPubkey: from.publicKey,
        toPubkey: to,
        lamports: sol * web3.LAMPORTS_PER_SOL,
    }));
    let fee = (await conn.getFeeForMessage(transaction.compileMessage())).value!! / web3.LAMPORTS_PER_SOL;
    console.log(`[Transfer] from ${from.publicKey.toBase58()} to ${to.toBase58()} ${sol} SOL, fee: ${fee}`);
    await web3.sendAndConfirmTransaction(conn, transaction, [from]);
}

export async function transfer2(conn: web3.Connection, from: Keypair, to: Address, sol: number) {
    to = normalizeAddress(to);
    let latestBlockhash = await conn.getLatestBlockhash();
    let transaction = new web3.Transaction({
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        feePayer: from.publicKey,
    }).add(web3.SystemProgram.transfer({
        fromPubkey: from.publicKey,
        toPubkey: to,
        lamports: sol * web3.LAMPORTS_PER_SOL,
    }));
    let fee = (await conn.getFeeForMessage(transaction.compileMessage())).value!! / web3.LAMPORTS_PER_SOL;
    console.log(`[Transfer] from ${from.publicKey.toBase58()} to ${to.toBase58()} ${sol} SOL, fee: ${fee}`);
    // 发送序列化交易，同时进行分离式数字签名
    // 1. 对序列化消息进行签名
    let transactionBuffer = transaction.serializeMessage();
    let { signedMessage, signature } = signMsg(transactionBuffer, from.secretKey);
    // 2. 将二进制签名添加到事务
    transaction.addSignature(from.publicKey, Buffer.from(signedMessage));
    // 3. 序列化交易
    let rawTransaction = transaction.serialize();
    // 4. 发送并确认交易
    await web3.sendAndConfirmRawTransaction(conn, rawTransaction, {
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        signature: signature,
    }, {
        commitment: "finalized",
    });
}

export async function showBalances(conn: web3.Connection, ...address: Address[]) {
    for (let addr of address) {
        addr = normalizeAddress(addr);
        let balance = await conn.getBalance(addr) / web3.LAMPORTS_PER_SOL;
        console.log(`[Balance] Address ${addr} balance: ${balance}`);
    }
}

function signMsg(message: Uint8Array | string, secretKey: web3.Ed25519SecretKey) {
    if (typeof message == "string") {
        message = new TextEncoder().encode(message);
    }
    let signedMessage = nacl.sign.detached(message, secretKey); // 签名
    let signature = base58.encode(signedMessage); // 签名的Base58字符串
    let encryptedMessage = nacl.sign(message, secretKey); // 加密
    return { encryptedMessage, signedMessage, signature };
}