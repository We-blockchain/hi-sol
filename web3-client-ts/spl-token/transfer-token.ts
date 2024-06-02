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

var mint_account = new PublicKey("E4cyPv4ATUUaJDpXXS6GQDjidbqNoGUVky2igdTUkSGV"); // 铸币账户
var owner_from = await helpers.getKeypairFromFile("~/.config/solana/id.json"); // 要负责转账的代币账户的所有者
// 要负责接收的代币账户的所有者
// var owner_to = Keypair.generate().publicKey; // Error: 需要先创建其代币账户
// var owner_to = (await helpers.getKeypairFromFile("./AtPhRzoFpbjUAbHr2PBs4uvKfC9oFHq39mUTLRu6QaLS.json")).publicKey;
var owner_to = new PublicKey("11111111111111111111111111111111"); // 注意: 需要先创建其代币账户
var programId = spl.TOKEN_2022_PROGRAM_ID; // 代币程序
var amount = 10; // 转账数量
var decimals = 9; // 代币精度

// 计算所有者对应的关联代币账户，该账户是关联程序派生的PDA地址
var [from_token_account] = PublicKey.findProgramAddressSync(
    [owner_from.publicKey.toBuffer(), programId.toBuffer(), mint_account.toBuffer()],
    spl.ASSOCIATED_TOKEN_PROGRAM_ID
);
var [to_token_account] = PublicKey.findProgramAddressSync(
    [owner_to.toBuffer(), programId.toBuffer(), mint_account.toBuffer()],
    spl.ASSOCIATED_TOKEN_PROGRAM_ID
);
console.log(`Transfer from ${from_token_account} to ${to_token_account} ${amount}`);
var tx = new Transaction().add(
    /**
     * Construct a Transfer instruction
        @param source — Source account
        @param destination — Destination account
        @param owner — Owner of the source account
        @param amount — Number of tokens to transfer
        @param multiSigners — Signing accounts if owner is a multisig
        @param programId — SPL Token program account
        @return — Instruction to add to a transaction
     */
    spl.createTransferInstruction(
        from_token_account,
        to_token_account,
        owner_from.publicKey,
        amount * Math.pow(10, decimals),
        [],
        programId
    ),
);
var signature = await web3.sendAndConfirmTransaction(conn, tx, [owner_from]);
console.log(`Signature:  ${signature}`);