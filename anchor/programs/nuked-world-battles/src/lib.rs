use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("ECsBgcjivboA86mcHfKvge98YG97vwMjBWnNPiLHseN5"); // Replace with your program ID

#[program]
pub mod nuked_world_battles {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, dev_wallet: Pubkey) -> Result<()> {
        let battle_pool = &mut ctx.accounts.battle_pool;
        battle_pool.dev_wallet = dev_wallet;
        battle_pool.total_deposited = 0;
        battle_pool.total_paid_out = 0;
        battle_pool.bump = ctx.bumps.battle_pool;
        Ok(())
    }

    pub fn create_battle_deposit(
        ctx: Context<CreateBattleDeposit>,
        battle_id: String,
        entry_fee: u64,
        max_participants: u8,
    ) -> Result<()> {
        let battle_deposit = &mut ctx.accounts.battle_deposit;
        battle_deposit.battle_id = battle_id;
        battle_deposit.creator = ctx.accounts.creator.key();
        battle_deposit.entry_fee = entry_fee;
        battle_deposit.max_participants = max_participants;
        battle_deposit.current_participants = 0;
        battle_deposit.total_deposited = 0;
        battle_deposit.status = BattleStatus::WaitingForPlayers;
        battle_deposit.bump = ctx.bumps.battle_deposit;
        Ok(())
    }

    pub fn join_battle(ctx: Context<JoinBattle>) -> Result<()> {
        let battle_deposit = &mut ctx.accounts.battle_deposit;
        let battle_pool = &mut ctx.accounts.battle_pool;

        require!(
            battle_deposit.status == BattleStatus::WaitingForPlayers,
            ErrorCode::BattleNotJoinable
        );

        require!(
            battle_deposit.current_participants < battle_deposit.max_participants,
            ErrorCode::BattleFull
        );

        // Transfer tokens from player to battle pool
        let cpi_accounts = Transfer {
            from: ctx.accounts.player_token_account.to_account_info(),
            to: ctx.accounts.battle_pool_token_account.to_account_info(),
            authority: ctx.accounts.player.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, battle_deposit.entry_fee)?;

        // Update battle state
        battle_deposit.current_participants += 1;
        battle_deposit.total_deposited += battle_deposit.entry_fee;
        battle_pool.total_deposited += battle_deposit.entry_fee;

        // If battle is full, mark as ready to start
        if battle_deposit.current_participants >= battle_deposit.max_participants {
            battle_deposit.status = BattleStatus::ReadyToStart;
        }

        Ok(())
    }

    pub fn complete_battle(ctx: Context<CompleteBattle>, winner: Pubkey) -> Result<()> {
        let battle_deposit = &mut ctx.accounts.battle_deposit;

        require!(
            ctx.accounts.dev_wallet.key() == ctx.accounts.battle_pool.dev_wallet,
            ErrorCode::UnauthorizedDev
        );

        battle_deposit.winner = Some(winner);
        battle_deposit.status = BattleStatus::Completed;
        Ok(())
    }

    pub fn payout_winner(ctx: Context<PayoutWinner>) -> Result<()> {
        let battle_deposit = &mut ctx.accounts.battle_deposit;

        require!(
            ctx.accounts.dev_wallet.key() == ctx.accounts.battle_pool.dev_wallet,
            ErrorCode::UnauthorizedDev
        );

        require!(
            battle_deposit.status == BattleStatus::Completed,
            ErrorCode::BattleNotCompleted
        );

        require!(battle_deposit.winner.is_some(), ErrorCode::NoWinner);

        let winner = battle_deposit.winner.unwrap();
        require!(
            ctx.accounts.winner_token_account.owner == winner,
            ErrorCode::InvalidWinner
        );

        // Calculate payout (95% to winner, 5% dev fee)
        let total_prize = battle_deposit.total_deposited;
        let dev_fee = total_prize * 5 / 100; // 5%
        let winner_payout = total_prize - dev_fee;

        // Transfer winner payout
        let seeds = &[b"battle_pool", &[ctx.accounts.battle_pool.bump][..]];
        let signer = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.battle_pool_token_account.to_account_info(),
            to: ctx.accounts.winner_token_account.to_account_info(),
            authority: ctx.accounts.battle_pool.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, winner_payout)?;

        // Transfer dev fee
        let cpi_accounts = Transfer {
            from: ctx.accounts.battle_pool_token_account.to_account_info(),
            to: ctx.accounts.dev_token_account.to_account_info(),
            authority: ctx.accounts.battle_pool.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, dev_fee)?;

        // Update state
        battle_deposit.status = BattleStatus::PaidOut;
        ctx.accounts.battle_pool.total_paid_out += total_prize;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = dev_wallet,
        space = 8 + BattlePool::INIT_SPACE,
        seeds = [b"battle_pool"],
        bump
    )]
    pub battle_pool: Account<'info, BattlePool>,

    #[account(mut)]
    pub dev_wallet: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(battle_id: String)]
pub struct CreateBattleDeposit<'info> {
    #[account(
        init,
        payer = creator,
        space = 8 + BattleDeposit::INIT_SPACE,
        seeds = [b"battle_deposit", battle_id.as_bytes()],
        bump
    )]
    pub battle_deposit: Account<'info, BattleDeposit>,

    #[account(mut)]
    pub creator: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct JoinBattle<'info> {
    #[account(
        mut,
        seeds = [b"battle_deposit", battle_deposit.battle_id.as_bytes()],
        bump = battle_deposit.bump
    )]
    pub battle_deposit: Account<'info, BattleDeposit>,

    #[account(
        mut,
        seeds = [b"battle_pool"],
        bump = battle_pool.bump
    )]
    pub battle_pool: Account<'info, BattlePool>,

    #[account(mut)]
    pub player: Signer<'info>,

    #[account(mut)]
    pub player_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub battle_pool_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct CompleteBattle<'info> {
    #[account(
        mut,
        seeds = [b"battle_deposit", battle_deposit.battle_id.as_bytes()],
        bump = battle_deposit.bump
    )]
    pub battle_deposit: Account<'info, BattleDeposit>,

    #[account(
        seeds = [b"battle_pool"],
        bump = battle_pool.bump
    )]
    pub battle_pool: Account<'info, BattlePool>,

    pub dev_wallet: Signer<'info>,
}

#[derive(Accounts)]
pub struct PayoutWinner<'info> {
    #[account(
        mut,
        seeds = [b"battle_deposit", battle_deposit.battle_id.as_bytes()],
        bump = battle_deposit.bump
    )]
    pub battle_deposit: Account<'info, BattleDeposit>,

    #[account(
        mut,
        seeds = [b"battle_pool"],
        bump = battle_pool.bump
    )]
    pub battle_pool: Account<'info, BattlePool>,

    #[account(mut)]
    pub battle_pool_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub winner_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub dev_token_account: Account<'info, TokenAccount>,

    pub dev_wallet: Signer<'info>,

    pub token_program: Program<'info, Token>,
}

#[account]
#[derive(InitSpace)]
pub struct BattlePool {
    pub dev_wallet: Pubkey,
    pub total_deposited: u64,
    pub total_paid_out: u64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct BattleDeposit {
    #[max_len(50)]
    pub battle_id: String,
    pub creator: Pubkey,
    pub entry_fee: u64,
    pub max_participants: u8,
    pub current_participants: u8,
    pub total_deposited: u64,
    pub status: BattleStatus,
    pub winner: Option<Pubkey>,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum BattleStatus {
    WaitingForPlayers,
    ReadyToStart,
    InProgress,
    Completed,
    PaidOut,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Battle is not joinable")]
    BattleNotJoinable,
    #[msg("Battle is full")]
    BattleFull,
    #[msg("Unauthorized dev wallet")]
    UnauthorizedDev,
    #[msg("Battle not completed")]
    BattleNotCompleted,
    #[msg("No winner set")]
    NoWinner,
    #[msg("Invalid winner")]
    InvalidWinner,
}
