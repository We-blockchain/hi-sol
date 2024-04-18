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
    _program_id: &Pubkey,
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

    msg!(&format!( "Transfer from {} to {} {}", from.key.to_string(), to.key.to_string(), sol));

    // 通过 solana rent 0 或 solana rent system 命令查询免租最低限额，这也是通过转账新开账户的最低限度
    // Rent-exempt minimum: 0.00089088 SOL
    if (sol.0 as f64) / (LAMPORTS_PER_SOL as f64) < 0.00089088 {
        msg!("没有必要的转账!");
        // return Ok(());
    }

    // 跨程序调用
    let result = invoke(
        &system_instruction::transfer(&from.key, &to.key, sol.0),
        &[from.clone(), to.clone()],
    );
    msg!(&format!("Transfer result: {:?}", result));

    // gracefully exit the program
    Ok(())
}
