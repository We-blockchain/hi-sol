import web3 from "@solana/web3.js";
// TweetNaCl 是世界上第一个可审计的高安全性密码库，https://github.com/dchest/tweetnacl-js
import nacl from 'tweetnacl';

let byte32 = nacl.randomBytes(32);
// 只需前32个字节就可恢复相同的SecretKey
// byte32 = Uint8Array.from([98, 189, 226, 198, 2, 192, 112, 255, 161, 24, 248, 194, 178, 197, 220, 188, 245, 253, 171, 123, 10, 44, 73, 7, 188, 176, 19, 152, 239, 189, 245, 182, 246, 26, 43, 168, 168, 83, 45, 236, 197, 127, 106, 38, 211, 77, 96, 240, 171, 62, 173, 96, 116, 54, 81, 150, 62, 212, 28, 100, 14, 34, 223, 24].slice(0, 32))
let keypair = web3.Keypair.fromSeed(byte32);
let solanaAddress: string = keypair.publicKey.toBase58();

let naclSeed = nacl.sign.keyPair.fromSeed(byte32).secretKey;
console.log({ byte32, solanaSeed: keypair.secretKey, naclSeed, address: solanaAddress });

// naclSeed 和 solanaSeed 的后32字节是等价的，和 bip39 通过助记词生成的 mnemonicToSeed、mnemonicToSeedSync 不等价
let naclAddress = web3.Keypair.fromSecretKey(naclSeed).publicKey.toBase58();
console.log({ solanaAddress, naclAddress });