use solana_program::native_token::{Sol, LAMPORTS_PER_SOL};

#[test]
fn test() {
    let instruction_data: &[u8] = "0.123".as_bytes();
    assert_eq!(instruction_data_to_u64(instruction_data).to_string(), "◎0.123000000");
    assert_eq!(instruction_data_to_u64("100".as_bytes()).to_string(), "◎100.000000000");
    assert_eq!(instruction_data_to_u64("0.000000001".as_bytes()).to_string(), "◎0.000000001");
    assert_eq!(instruction_data_to_u64("1.000000010".as_bytes()).to_string(), "◎1.000000009"); // 精度丢失
    assert_eq!(instruction_data_to_u64("-1".as_bytes()).to_string(), "◎0.000000000");
    assert_eq!(instruction_data_to_u64("-99".as_bytes()).0, 0);
}

/// UTF-8 字符串形式的非负实数转换为 SOL 代币数
fn instruction_data_to_u64(instruction_data: &[u8]) -> Sol {
    let sol = String::from_utf8(instruction_data.to_vec()).unwrap();
    println!("str: {sol}");
    let sol: f64 = sol.parse().unwrap();
    println!("sol: {sol}");
    // 等价于 solana_program::native_token::sol_to_lamports(f64)
    let lamports: u64 = (sol * (LAMPORTS_PER_SOL as f64)) as u64;
    // let lamports: u64 = solana_program::native_token::sol_to_lamports(sol);
    println!("lamports: {lamports}");
    Sol(lamports)
}