use solana_program::account_info::AccountInfo;
use solana_program::entrypoint::ProgramResult;
use solana_program::native_token::LAMPORTS_PER_SOL;
use solana_program::program::invoke_signed;
use solana_program::pubkey::Pubkey;
use solana_program::{msg, system_instruction};

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let mut accounts = accounts.iter();
    let pda_account = accounts.next().unwrap();
    let newbie = accounts.next().unwrap();

    // 每个seed都可以确定一个唯一的PDA地址
    let seed: &[u8] = b"PDA-seed";
    let (pda, bump) = Pubkey::find_program_address(&[seed], program_id);
    msg!(&format!("PDA address: {pda}, bump: {bump}"));

    // 转移PDA账户SOL余额
    // PDA地址没有私钥，意味着无法在链下对其进行签名，修改Owner等操作只能由派生它的链上程序发起
    // 向还未注册到链上的PDA账户存入SOL后，其Owner是系统程序，所以只能跨程序调用system_instruction::transfer进行转账
    // 而不能直接修改lamports字段
    // 除非本程序调用system_instruction::create_account创建账户时指定Onwer为本程序
    // （发挥一下想象，如果曲线外地址的Owner也是一个曲线外地址（无效的程序地址），则没有人能够对其代币进行转移，相当于黑洞地址）
    let sol = *instruction_data.get(0).unwrap_or(&10) as u64;
    let sol = sol * LAMPORTS_PER_SOL;
    let () = invoke_signed(
        &system_instruction::transfer(&pda, &newbie.key, sol),
        &[pda_account.clone(), newbie.clone()],
        &[&[seed, &[bump]]],
    )?;
    Ok(())
}
