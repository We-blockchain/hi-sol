import web3, { Keypair, Message, Transaction } from "@solana/web3.js";
import { airdrop, generateTransferOrder, showBalances, transfer2 } from "./utils";
import base58 from "bs58";
import { signMsg } from "./sign";
import { sleep } from "./js";

var rpc = "http://localhost:8899";
// rpc = web3.clusterApiUrl("mainnet-beta");
let conn = new web3.Connection(rpc);

console.log({ blockHeight: await conn.getBlockHeight(), ...await conn.getLatestBlockhash() });

// let from = web3.Keypair.generate();
// await airdrop(conn, from.publicKey, 100);
let from = web3.Keypair.fromSeed(Uint8Array.from([98,189,226,198,2,192,112,255,161,24,248,194,178,197,220,188,245,253,171,123,10,44,73,7,188,176,19,152,239,189,245,182]));
let to = web3.Keypair.generate();

async function testTransfer2() {
    await showBalances(conn, from.publicKey, to.publicKey);
    console.log("转账中...");
    await transfer2(conn, from, to.publicKey, 1);
    console.log("转账结果");
    await showBalances(conn, from.publicKey, to.publicKey);
}

/**
 * 解析交易消息并签名，返回交易序列化
 * @param message 序列化并编码为Base58的未签名交易消息
 * @param signer 签署人
 * @returns tx - 编码为Base58的已签名交易序列化
 * @returns signature - 编码为Base58的消息签名
 */
export async function confirmAndSignMsg(message: string, signer: Keypair) {
    // 1. 将Base58形式的消息进行解码并反序列化为Message
    let msg: Message = Message.from(base58.decode(message));
    // 2. 将消息填充为交易
    let transaction: Transaction = Transaction.populate(msg);
    // 3. 将消息序列化为Buffer，以下三种方式等价：
    // let serializeBuffer: Buffer = msg.serialize();
    let serializeBuffer: Buffer = transaction.serializeMessage();
    // let serializeBuffer: Buffer = Buffer.from(base58.decode(message));
    // 4. 对序列化的消息Buffer进行签名
    // let { signature, signedMessage } = signMsg(serializeBuffer, signer.secretKey);
    // same as:
    let { signature, signedMessage } = signMsg(base58.decode(message), signer.secretKey);
    // 5. 将签名添加到交易
    transaction.addSignature(signer.publicKey, Buffer.from(signedMessage));
    // 6. 序列化交易
    let rawTransaction: Buffer = transaction.serialize();
    // 7. 将带签名的交易编码为Base58
    let tx = base58.encode(rawTransaction);
    return { tx, signature };
}

async function testTransferOrder() {
    await showBalances(conn, from.publicKey, to.publicKey);
    console.log("生成交易中...");
    // let { message, fee } = await generateTransferOrder(conn, from.publicKey, to.publicKey, 1);
    // console.log({ message, fee });
    var message = '87PYvQBRgZK1u7WsYqWKhdGb8oEoPJz9EET7pmn7hpGEHKjDhScrGXc7Ch6QP3212c3pRRR5YvJ6Kh4ZsoX31LbzLqADcPav4GkqqTXWjLAUFUUhGAvpBRihLNrS3mk8L8pvzfnjm6hrn1Ccf7JGxVbQ7J3EXFHSSkTyS192Jx1hHwL1jqeAp5nTUtNi3u5kWm28bbEMwqJP';
    // return;

    console.log("确认交易细节并签署交易中...");
    let { tx, signature } = await confirmAndSignMsg(message, from);
    console.log({ tx, signature });
    // 还原tx，可以发现message不变
    // let signedTx = Transaction.from(Buffer.from(base58.decode(tx)));
    // console.log({ message: base58.encode(signedTx.serializeMessage()) });

    // 如果签名的区块距离链上最新区块已相距太远，交易会被拒绝
    // 超过 150 个区块过期，Solana 的出块时间为 400 毫秒
    // 150 * 400ms = 60 seconds，意味着我们需要在一分钟之内签署并发送交易
    // See: https://solana.com/docs/core/transactions/fees
    // See: https://solanacookbook.com/references/offline-transactions.html#sign-transaction
    // See: https://stackoverflow.com/questions/70717996/blockhash-not-found-when-sending-transaction
    // await sleep(60000);
    await sleep(1000);
    console.log({ blockHeight: await conn.getBlockHeight() });

    console.log("转账中...");
    // 方式1：conn.sendEncodedTransaction(base64)
    // let encodedTransaction = Buffer.from(base58.decode(tx)).toString("base64");
    // let hash = await conn.sendEncodedTransaction(encodedTransaction);
    // console.log({ hash });

    // 方式2：conn.sendRawTransaction(buffer)
    // let hash = await conn.sendRawTransaction(base58.decode(tx));
    // console.log({ hash });

    // 方式3：web3.sendAndConfirmRawTransaction(conn, rawTransaction, ...);
    let latestBlockhash = await conn.getLatestBlockhash();
    let result = await web3.sendAndConfirmRawTransaction(conn, Buffer.from(base58.decode(tx)), {
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        signature: signature,
    }, {
        commitment: "finalized",
    });
    console.log(result);


    console.log("转账结果");
    await showBalances(conn, from.publicKey, to.publicKey);
}

switch (1) {
    case null:
        testTransfer2();
    case null:
        testTransferOrder();
    default:
        testTransferOrder();
}