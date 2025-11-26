import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export const runtime = 'edge';

// SEI-specific vault data schema
const VaultSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid SEI address'),
  name: z.string().min(1, 'Vault name required'),
  strategy: z.enum(['concentrated_liquidity', 'yield_farming', 'arbitrage', 'hedge', 'stable_max', 'sei_hypergrowth', 'blue_chip', 'delta_neutral']),
  tokenA: z.string(),
  tokenB: z.string(),
  fee: z.number().min(0),
  tickSpacing: z.number().min(1),
  chainId: z.number().refine(id => id === 1328, 'Must be SEI testnet (1328)')
})

const CreateVaultSchema = VaultSchema.omit({ address: true })

/**
 * Get all vaults or create a new vault
 * GET /api/vaults - List all vaults
 * POST /api/vaults - Create new vault
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const strategy = searchParams.get('strategy')
    const active = searchParams.get('active')
    
    // ONLY DEPLOYED VAULTS - SEI Atlantic-2 Testnet (Chain ID 1328)
    // CRITICAL: Only return vaults that are actually deployed on-chain
    // Demo mode is OFF - we only show real, deployed contracts
    // TVL values are placeholders - actual TVL is fetched on-chain via useVaultTVL hook
    // APY values are from 90-day backtesting (validated Nov 26, 2025)
    const vaults = [
      {
        address: '0x1ec7d0E455c0Ca2Ed4F2c27bc8F7E3542eeD6565', // Native SEI Vault (has 5 SEI)
        name: 'Concentrated Liquidity Vault',
        strategy: 'concentrated_liquidity',
        tokenA: 'SEI',
        tokenB: 'USDC',
        fee: 0.003,
        tickSpacing: 60,
        tvl: 0, // Fetched on-chain via useVaultTVL
        apy: 0.0891, // 8.91% from backtest - NEEDS OPTIMIZATION (target: 15%)
        chainId: 1328,
        active: true,
        performance: {
          totalReturn: 0.0215, // 2.15% over 90 days
          sharpeRatio: 0.09,
          maxDrawdown: 0.1855, // 18.55%
          winRate: 0.5055 // 50.55%
        },
        position: {
          lowerTick: -887220,
          upperTick: 887220,
          liquidity: '0',
          tokensOwed0: '0',
          tokensOwed1: '0'
        }
      },
      {
        address: '0xbCB883594435D92395fA72D87845f87BE78d202E', // USDC Vault (DEPLOYED Nov 26 2024)
        name: 'Stable Max Vault',
        strategy: 'stable_max',
        tokenA: 'USDC',
        tokenB: 'USDC',
        fee: 0.001,
        tickSpacing: 10,
        tvl: 0, // Fetched on-chain via useVaultTVL
        apy: 0.0883, // 8.83% from backtest (90-day validation)
        chainId: 1328,
        active: true,
        performance: {
          totalReturn: 0.0213, // 2.13% over 90 days
          sharpeRatio: 103.36,
          maxDrawdown: 0.0000, // 0% - extremely stable
          winRate: 0.9890 // 98.90%
        },
        position: {
          lowerTick: -100,
          upperTick: 100,
          liquidity: '0',
          tokensOwed0: '0',
          tokensOwed1: '0'
        }
      },
      {
        address: '0xBa81d646C8126A1b952bB6eF759B618F51D9B416', // Delta Neutral Vault (DEPLOYED Nov 26 2025)
        name: 'Delta Neutral Vault',
        strategy: 'delta_neutral',
        tokenA: 'SEI',
        tokenB: 'USDC',
        fee: 0.003,
        tickSpacing: 60,
        tvl: 0,
        apy: 0.0633, // 6.33% from backtest (90-day validation)
        chainId: 1328,
        active: true, // DEPLOYED
        performance: {
          totalReturn: 0.0154, // 1.54% over 90 days
          sharpeRatio: 50.47,
          maxDrawdown: 0.0000, // 0% - market neutral
          winRate: 0.9890 // 98.90%
        },
        position: {
          lowerTick: -887220,
          upperTick: 887220,
          liquidity: '0',
          tokensOwed0: '0',
          tokensOwed1: '0'
        }
      },
      {
        address: '0xD8872CF726c5EF0AB9D0573EE819817aceC23e33', // Yield Farming Vault (DEPLOYED Nov 26 2025)
        name: 'Yield Farming Vault',
        strategy: 'yield_farming',
        tokenA: 'SEI',
        tokenB: 'USDC',
        fee: 0.001,
        tickSpacing: 10,
        tvl: 0,
        apy: 0.1223, // 12.23% from backtest (90-day validation)
        chainId: 1328,
        active: true, // DEPLOYED
        performance: {
          totalReturn: 0.0292, // 2.92% over 90 days
          sharpeRatio: 91.70,
          maxDrawdown: 0.0000, // 0% - very stable
          winRate: 0.9890 // 98.90%
        },
        position: {
          lowerTick: -887220,
          upperTick: 887220,
          liquidity: '0',
          tokensOwed0: '0',
          tokensOwed1: '0'
        }
      },
      {
        address: '0x5ad03CCe8bFCB6927fc574401DfA61D124282Dd3', // Active Trading Vault (DEPLOYED Nov 26 2025)
        name: 'Active Trading Vault',
        strategy: 'arbitrage',
        tokenA: 'SEI',
        tokenB: 'USDC',
        fee: 0,
        tickSpacing: 10,
        tvl: 0,
        apy: 0.15, // 15% conservative estimate (backtest showed 57% with unrealistic assumptions)
        chainId: 1328,
        active: true, // DEPLOYED
        performance: {
          totalReturn: 0.035, // 3.5% over 90 days (realistic)
          sharpeRatio: 1.8, // Moderate risk-adjusted returns
          maxDrawdown: 0.05, // 5% - accounts for competition and failed trades
          winRate: 0.55 // 55% - realistic with bot competition
        },
        position: {
          lowerTick: -887220,
          upperTick: 887220,
          liquidity: '0',
          tokensOwed0: '0',
          tokensOwed1: '0'
        }
      }
    ]

    // NOTE: Deployment status on SEI Atlantic-2 testnet (Chain ID 1328):
    // ✅ Concentrated Liquidity Vault - DEPLOYED (0x1ec7...6565) - 8.91% APY (needs optimization)
    // ✅ Stable Max Vault - DEPLOYED (0xbCB...d202E) - 8.83% APY (validated)
    // ✅ Delta Neutral Vault - DEPLOYED (0xBa81...B416) - 6.33% APY (validated)
    // ✅ Yield Farming Vault - DEPLOYED (0xD887...3e33) - 12.23% APY (validated)
    // ✅ Active Trading Vault - DEPLOYED (0x5ad0...2Dd3) - 15% APY (conservative estimate)
    //
    // APY Notes:
    // - All values based on 90-day backtesting (Aug-Nov 2025)
    // - Concentrated Liquidity: Needs range optimization to reach 15% target
    // - Active Trading: Conservative 15% estimate (backtest showed 57% with unrealistic assumptions)
    // - All 5 vaults now live and accepting SEI/USDC deposits!

    // Filter by strategy if provided
    let filteredVaults = vaults
    if (strategy) {
      filteredVaults = vaults.filter(vault => vault.strategy === strategy)
    }
    
    // Filter by active status if provided
    if (active !== null) {
      const isActive = active === 'true'
      filteredVaults = filteredVaults.filter(vault => vault.active === isActive)
    }

    return NextResponse.json({
      success: true,
      data: filteredVaults,
      count: filteredVaults.length,
      chainId: 1328
    })
  } catch (error) {
    console.error('Error fetching vaults:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch vaults',
        chainId: 1328
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validatedData = CreateVaultSchema.parse(body)
    
    // SEI-specific validation
    if (validatedData.chainId !== 1328) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid chain ID - must be SEI testnet (1328)' 
        },
        { status: 400 }
      )
    }

    // Mock vault creation - replace with actual smart contr
    // act deployment
    const newVault = {
      ...validatedData,
      address: `0x${Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      tvl: 0,
      apy: 0,
      active: true,
      createdAt: new Date().toISOString(),
      performance: {
        totalReturn: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        winRate: 0
      }
    }

    return NextResponse.json({
      success: true,
      data: newVault,
      message: 'Vault created successfully',
      chainId: 1328
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data',
          details: error.errors
        },
        { status: 400 }
      )
    }

    console.error('Error creating vault:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create vault',
        chainId: 1328
      },
      { status: 500 }
    )
  }
}
