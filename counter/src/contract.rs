use solana_program::{account_info::{next_account_info, AccountInfo}, entrypoint::ProgramResult, msg, pubkey::Pubkey};

pub fn entrypoint(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let first_account_info = next_account_info(account_info_iter)?;
    let mut data = first_account_info.data.borrow_mut();
    data[0] += instruction_data[0];
    msg!(&format!("Counter is: {}", data[0]));
    Ok(())
}