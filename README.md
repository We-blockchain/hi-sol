# hi-sol

## program

Init a Rust libraray:
```bash
cargo new program --lib
cd program
#cargo add solana-program
cargo add solana-program@=1.17.17
```

Edit Cargo.toml:
```
[lib]
name = "program"
crate-type = ["cdylib", "lib"]
```

## other

Solana Quickstart Guide: https://docs.solana.com/getstarted/hello-world

Solana Playground | Solana IDE: https://beta.solpg.io/
