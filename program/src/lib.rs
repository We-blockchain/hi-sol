use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    pubkey::Pubkey,
};

// declare and export the program's entrypoint
entrypoint!(process_instruction);

// program entrypoint's implementation
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    // log a message to the blockchain
    msg!("Hello, world!");
    msg!(&format!("instruction_data: {:?}", instruction_data));

    let account_info_iter = &mut accounts.iter();

    let first_account_info = next_account_info(account_info_iter)?;
    msg!(&format!(
        "first: {} isSigner: {}, isWritable: {}",
        first_account_info.key.to_string(),
        first_account_info.is_signer,
        first_account_info.is_writable,
    ));

    let second_account_info = next_account_info(account_info_iter)?;
    msg!(&format!(
        "second: {} isSigner: {}, isWritable: {}",
        second_account_info.key.to_string(),
        second_account_info.is_signer,
        second_account_info.is_writable,
    ));

    // gracefully exit the program
    Ok(())
}
