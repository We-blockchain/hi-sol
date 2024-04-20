#[cfg(test)]
mod test;

use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    native_token::{sol_to_lamports, Sol, LAMPORTS_PER_SOL},
    program::invoke,
    pubkey::Pubkey,
    system_instruction,
};

// declare and export the program's entrypoint
entrypoint!(process_instruction);

// program entrypoint's implementation
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    // 计算 SOL 数量
    msg!(&format!("instruction_data: {:?}", instruction_data));
    let sol = String::from_utf8(instruction_data.to_vec()).unwrap();
    let sol: f64 = sol.parse().unwrap();
    let lamports: u64 = sol_to_lamports(sol) as u64;
    let sol = Sol(lamports);

    // 取出账户信息
    let account_iter = &mut accounts.iter();
    let from = next_account_info(account_iter)?;
    let to = next_account_info(account_iter)?;
    // 要跨程序调用调用系统指令，必须传入系统程序账户
    let _system_program = next_account_info(account_iter)?;

    // 通过 solana rent 0 或 solana rent system 命令查询免租最低限额，这也是通过转账新开账户的最低限度
    // Rent-exempt minimum: 0.00089088 SOL
    if sol.0 < (0.00089088 * LAMPORTS_PER_SOL as f64) as u64 {
        msg!("没有必要的转账!");
        return Ok(());
    }
    msg!(&format!( "Transfer from {} to {} {}", from.key.to_string(), to.key.to_string(), sol));

    // 如果支付SOL的地址不属于系统程序，则不能调用系统程序来进行Transfer，必须由所属的程序通过修改lamports字段来实现
    // 如果程序拥有账户，那么程序不需要签名就可以转移代币
    if from.owner == program_id {
    // 可以强制要求签名
    // if from.is_signer && from.owner == program_id {
        msg!("Owner is this program!");
        // SOL转移数量必须匹配
        // 移动账户所有余额，删除旧账户
        // **to.try_borrow_mut_lamports()? += from.lamports();
        // **from.try_borrow_mut_lamports()? = 0;
        // 正常转账
        **to.try_borrow_mut_lamports()? += sol.0;
        **from.try_borrow_mut_lamports()? -= sol.0;
    } else {
        // 跨程序调用
        let result = invoke(
            &system_instruction::transfer(&from.key, &to.key, sol.0),
            &[from.clone(), to.clone()],
        );
        msg!(&format!("Transfer result: {:?}", result));
    }

    // gracefully exit the program
    Ok(())
}
