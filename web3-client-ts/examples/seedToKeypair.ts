import web3 from "@solana/web3.js";
// TweetNaCl 是世界上第一个可审计的高安全性密码库，https://github.com/dchest/tweetnacl-js
import nacl from 'tweetnacl';

/**
 * web3.Keypair.fromSeed()的tweetnacl实现
 * @param seed 种子，32字节的随机数
 * @returns 
 */
export function seedToKeypair(seed: Uint8Array) {
    let { publicKey, secretKey } = nacl.sign.keyPair.fromSeed(seed);
    return { publicKey: new web3.PublicKey(publicKey), secretKey };
}

function testSeedToKeypair() {
    let byte32 = nacl.randomBytes(32);
    let keypair = web3.Keypair.fromSeed(byte32);
    let solanaAddress: string = keypair.publicKey.toBase58();

    let naclSeed = seedToKeypair(byte32).secretKey;
    console.log({ byte32, solanaSeed: keypair.secretKey, naclSeed });

    // naclSeed 和 solanaSeed 的后32字节是等价的，和 bip39 通过助记词生成的 mnemonicToSeed、mnemonicToSeedSync 不等价
    let naclAddress = seedToKeypair(byte32).publicKey.toBase58();
    console.log({ solanaAddress, naclAddress });
}

switch (1) {
    case null:
        testSeedToKeypair();
    default:
}