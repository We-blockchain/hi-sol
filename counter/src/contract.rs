use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    msg,
    pubkey::Pubkey,
};

pub fn entrypoint(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let first_account_info = next_account_info(account_info_iter)?;

    if first_account_info.owner != program_id {
        msg!(&format!(
            "账户 {} 不属于 {}，而是属于 {}，请先执行web3-client-ts/counter/createOwner.ts",
            first_account_info.key, program_id, first_account_info.owner
        ));
        return Ok(());
    }

    let mut data = first_account_info.data.borrow_mut();
    data[0] += instruction_data[0];

    let owner = bs58::decode("3DHRsdoXRZR6DMMhCsd7npska1GmcS9b5qhfw186nTJ2")
        .into_vec()
        .unwrap();
    let owner = Pubkey::try_from(owner).unwrap();
    // use std::str::FromStr;
    // let owner = Pubkey::from_str("3DHRsdoXRZR6DMMhCsd7npska1GmcS9b5qhfw186nTJ2").unwrap();
    msg!(&format!(
        "Counter is: {}, data from account {}",
        data[0], owner
    ));
    Ok(())
}
