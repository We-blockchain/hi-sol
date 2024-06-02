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

var authority = await helpers.getKeypairFromFile("~/.config/solana/id.json"); // 铸币者
var mint_account = new PublicKey("E4cyPv4ATUUaJDpXXS6GQDjidbqNoGUVky2igdTUkSGV"); // 铸币账户
var decimals = 9; // 代币精度
var programId = spl.TOKEN_2022_PROGRAM_ID; // 代币程序
var amount = 10; // 转账数量

// 计算所有者对应的关联代币账户，该账户是关联程序派生的PDA地址
// var owner = new PublicKey("EBzE4EUt2GDNoKE5nWBqnucxdYGxWDAj4uWWVbXhnYJ1"); // 代币账户的所有者
// var [token_account] = PublicKey.findProgramAddressSync(
//     [owner.toBuffer(), programId.toBuffer(), mint_account.toBuffer()],
//     spl.ASSOCIATED_TOKEN_PROGRAM_ID
// );
var token_account = new PublicKey("ELtkWPvcRkjoxy43ionGM6igDCk27XRVNRPa5VaQwTPo"); // 直接转币到他人的代币账户
console.log(`Minting ${amount} tokens\n Token: ${mint_account}\n Recipient: ${token_account}`);
var tx = new Transaction().add(
    /**
     * Construct a MintTo instruction
        @param mint — Public key of the mint
        @param destination — Address of the token account to mint to
        @param authority — The mint authority
        @param amount — Amount to mint
        @param multiSigners — Signing accounts if authority is a multisig
        @param programId — SPL Token program account
        @return — Instruction to add to a transaction
     */
    spl.createMintToInstruction(
        mint_account,
        token_account,
        authority.publicKey,
        amount * Math.pow(10, decimals),
        [],
        programId
    ),
);
var signature = await web3.sendAndConfirmTransaction(conn, tx, [authority]); // 铸币者签名
console.log(`Signature:  ${signature}`);