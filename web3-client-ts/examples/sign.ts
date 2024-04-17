import web3 from "@solana/web3.js";
// TweetNaCl 是世界上第一个可审计的高安全性密码库，https://github.com/dchest/tweetnacl-js
// TweetNacl 是 NaCl 的紧凑实现: https://en.wikipedia.org/wiki/NaCl_(software)
// 许多平台都有 NaCl 兼容的实现, 比如 Libsodium: https://doc.libsodium.org
import nacl from 'tweetnacl';
import base58 from 'bs58';

function seedToKeypair(seed: Uint8Array) {
    let { publicKey, secretKey } = nacl.sign.keyPair.fromSeed(seed);
    return { publicKey: new web3.PublicKey(publicKey), secretKey };
}

// Solana签名系统使用一种名为Ed25519的高速高安全签名的非对称加密算法, 生成的签名内容小(大小为 64 字节): https://ed25519.cr.yp.to
// https://docs.solanalabs.com/de/cli/examples/sign-offchain-message
export function signMsg(message: Uint8Array | string, secretKey: web3.Ed25519SecretKey) {
    if (typeof message == "string") {
        message = new TextEncoder().encode(message);
    }
    /**
     * 使用nacl.sign签名消息其实是使用私钥进行非对称加密, 签名后的消息可以通过公钥解密出原始数据:
     *   nacl.sign(message, secretKey) -> signedMessage
     *   nacl.sign.open(signedMessage, publicKey) -> message | null  
     * 分离式签名是一种数字签名, 与签名数据分开保存, 而不是捆绑在一起, 通过数字签名可以验证某公钥对应的私钥持有者是否签署了某份消息
     * 由于分离式签名很常见, 因此引入了两个新的 API 函数:
     *   nacl.sign.detached(message, secretKey) -> signature
     *   nacl.sign.detached.verify(message, signature, publicKey) -> true | false
     * 参考: https://github.com/dchest/tweetnacl-js/blob/master/CHANGELOG.md#v0100
     */
    let signedMessage = nacl.sign.detached(message, secretKey); // 签名
    let signature = base58.encode(signedMessage); // 签名的Base58字符串
    let encryptedMessage = nacl.sign(message, secretKey); // 加密
    return { encryptedMessage, signedMessage, signature };
}

export function decodeMsg(encryptedMessage: Uint8Array, publicKey: web3.PublicKey | Uint8Array | string) {
    switch (true) {
        case publicKey instanceof web3.PublicKey: {
            return nacl.sign.open(encryptedMessage, publicKey.toBytes());
        }
        case publicKey instanceof Uint8Array: {
            return nacl.sign.open(encryptedMessage, publicKey);
        }
        case typeof publicKey == "string": {
            return nacl.sign.open(encryptedMessage, base58.decode(publicKey));
        }
    }
}

function testSingMsg() {
    let byte32 = Uint8Array.from([98, 189, 226, 198, 2, 192, 112, 255, 161, 24, 248, 194, 178, 197, 220, 188, 245, 253, 171, 123, 10, 44, 73, 7, 188, 176, 19, 152, 239, 189, 245, 182, 246, 26, 43, 168, 168, 83, 45, 236, 197, 127, 106, 38, 211, 77, 96, 240, 171, 62, 173, 96, 116, 54, 81, 150, 62, 212, 28, 100, 14, 34, 223, 24].slice(0, 32));
    let { publicKey, secretKey } = seedToKeypair(byte32);
    let msg = new TextEncoder().encode("\xffsolana offchainHello"); // 为了确保链下消息不是有效的交易, Solana CLI添加了"\xffsolana offchain"前缀
    let { encryptedMessage, signedMessage, signature } = signMsg(msg, secretKey);
    console.log({ msg, encryptedMessage, signedMessage, signature, signer: publicKey.toBase58() });
    let decodedmsg = decodeMsg(encryptedMessage, publicKey);
    console.log({ decodedmsg, msg: new TextDecoder().decode(msg) });
}

switch (1) {
    case null:
        testSingMsg();
    default:
}