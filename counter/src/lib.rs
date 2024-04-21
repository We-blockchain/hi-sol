mod contract;

use solana_program::entrypoint;
use solana_program::{account_info::AccountInfo, entrypoint::ProgramResult, pubkey::Pubkey};

entrypoint!(process_instruction);

fn process_instruction(
    program_id: &Pubkey,      // Public key of the account the program was loaded into
    accounts: &[AccountInfo], // All accounts required to process the instruction
    instruction_data: &[u8],  // Serialized instruction-specific data
) -> ProgramResult {
    contract::entrypoint(program_id, accounts, instruction_data)
}
