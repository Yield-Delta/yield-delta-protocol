/**
 * Cloudflare Function for Kairos/Eliza AI Chat
 * Handles both GET and POST requests for the AI chat API
 * Supports multiple agent backends with intelligent routing and fallback
 */

import { z } from 'zod'

// Agent response type
interface AgentResponse {
  message: string
  confidence: number
  actions?: string[]
  suggestions?: string[]
  metadata?: {
    model?: string
    responseTime?: string
    processingSource?: string
    chainOptimized?: string
    fallbackReason?: string
    agentName?: string
  }
}

// Chat request schema
const ChatRequestSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  vaultAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid vault address').optional(),
  context: z.object({
    currentPage: z.string().optional(),
    vaultData: z.any().optional(),
    userPreferences: z.any().optional()
  }).optional(),
  chainId: z.number().refine(id => id === 1328, 'Must be SEI testnet (1328)').default(1328)
})

/**
 * Cloudflare Function handler
 */
export async function onRequestPost(context: any) {
  try {
    const request = context.request
    const body = await request.json()
    
    // Validate request
    const validatedData = ChatRequestSchema.parse(body)
    
    // Call Eliza agent
    const elizaResponse = await callElizaAgent(validatedData, context.env)
    
    return new Response(JSON.stringify({
      success: true,
      data: elizaResponse,
      timestamp: new Date().toISOString(),
      chainId: 1328
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid chat request',
        details: error.errors
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    console.error('Error in Eliza chat:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to communicate with AI agent',
      chainId: 1328
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
}

/**
 * Handle GET requests for agent status
 * Returns health check for both Kairos and Eliza agents
 */
export async function onRequestGet(context: any) {
  const KAIROS_AGENT_URL = context.env.KAIROS_AGENT_URL || context.env.ELIZA_AGENT_URL || 'https://www.yielddelta.xyz'
  const ELIZA_AGENT_URL = context.env.ELIZA_AGENT_URL || 'https://www.yielddelta.xyz'
  const ACTIVE_AGENT = context.env.ACTIVE_AGENT || 'kairos'

  const activeUrl = ACTIVE_AGENT === 'kairos' ? KAIROS_AGENT_URL : ELIZA_AGENT_URL

  try {
    // Check health with retry logic
    const response = await fetchWithRetry(`${activeUrl}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    }, 2)

    const agentName = ACTIVE_AGENT === 'kairos' ? 'Kairos' : 'Liqui'

    return new Response(JSON.stringify({
      success: true,
      agentStatus: response.ok ? 'online' : 'error',
      agentName,
      agentUrl: activeUrl,
      activeAgent: ACTIVE_AGENT,
      capabilities: [
        'vault_analysis',
        'rebalance_recommendations',
        'market_predictions',
        'sei_optimizations',
        'real_time_price_data',
        'yield_delta_protocol_info'
      ],
      fallbackMode: !response.ok,
      timestamp: new Date().toISOString()
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=30'
      }
    })
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      agentStatus: 'offline',
      agentName: ACTIVE_AGENT === 'kairos' ? 'Kairos' : 'Liqui',
      agentUrl: activeUrl,
      activeAgent: ACTIVE_AGENT,
      error: error instanceof Error ? error.message : 'Connection failed',
      fallbackMode: true,
      fallbackCapabilities: [
        'basic_vault_questions',
        'rebalancing_guidance',
        'gas_cost_info',
        'apy_calculations'
      ],
      timestamp: new Date().toISOString()
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=10'
      }
    })
  }
}

/**
 * Handle OPTIONS requests for CORS
 */
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}

/**
 * Retry helper function with exponential backoff
 */
async function fetchWithRetry(url: string, options: RequestInit, retries: number = 3, delay: number = 1000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options)
      if (response.ok) return response

      // If 5xx error, retry; otherwise throw
      if (response.status >= 500 && i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
        continue
      }
      return response
    } catch (error) {
      if (i === retries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
    }
  }
  throw new Error('Max retries exceeded')
}

/**
 * Call AI agent (Kairos or Eliza) with user message
 */
async function callElizaAgent(data: z.infer<typeof ChatRequestSchema>, env: any): Promise<AgentResponse> {
  const KAIROS_AGENT_URL = env.KAIROS_AGENT_URL || env.ELIZA_AGENT_URL || 'https://www.yielddelta.xyz'
  const ELIZA_AGENT_URL = env.ELIZA_AGENT_URL || 'https://www.yielddelta.xyz'
  const ACTIVE_AGENT = env.ACTIVE_AGENT || 'kairos'

  const agentUrl = ACTIVE_AGENT === 'kairos' ? KAIROS_AGENT_URL : ELIZA_AGENT_URL
  const agentName = ACTIVE_AGENT === 'kairos' ? 'Kairos' : 'Liqui'
  
  try {
    // First check if the agent is reachable with retry logic
    const healthCheck = await fetchWithRetry(`${agentUrl}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    }, 2)

    if (!healthCheck.ok) {
      throw new Error(`${agentName} agent health check failed: ${healthCheck.status}`)
    }

    // Format message for ElizaOS agent (correct UIMessage format)
    const agentMessage = {
      content: {
        text: data.message,
        source: 'yield-delta-dashboard',
        agentName: agentName
      },
      user: 'dashboard-user',
      room: data.vaultAddress ? `vault-${data.vaultAddress}` : 'general-chat',
      context: {
        chainId: data.chainId,
        vaultAddress: data.vaultAddress,
        currentPage: data.context?.currentPage || 'vaults',
        timestamp: new Date().toISOString(),
        protocol: 'yield-delta',
        chain: 'SEI',
        ...data.context
      }
    }

    // Send to agent with retry logic
    const response = await fetchWithRetry(`${agentUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Source': 'yield-delta-dashboard',
        'X-Agent-Name': agentName
      },
      body: JSON.stringify(agentMessage),
      signal: AbortSignal.timeout(20000)
    }, 2)

    if (!response.ok) {
      throw new Error(`${agentName} agent error: ${response.status} ${response.statusText}`)
    }

    const agentData = await response.json()

    return {
      message: agentData.response || agentData.content?.text || agentData.message || 'No response from AI agent',
      confidence: agentData.confidence || 0.85,
      actions: agentData.actions || [],
      suggestions: agentData.suggestions || generateSmartSuggestions(data.message),
      metadata: {
        model: ACTIVE_AGENT === 'kairos' ? 'kairos-ai-agent' : 'liqui-ai-agent',
        responseTime: agentData.responseTime || '~1s',
        processingSource: `${ACTIVE_AGENT}-agent`,
        chainOptimized: 'SEI',
        agentName: agentName
      }
    }
  } catch (error) {
    console.error(`Failed to call ${agentName} agent, using fallback response:`, error)

    // Fallback response if agent is unavailable
    return {
      message: generateFallbackResponse(data.message, data.vaultAddress, agentName),
      confidence: 0.6,
      actions: [],
      suggestions: generateSmartSuggestions(data.message),
      metadata: {
        model: 'fallback-responses',
        responseTime: 'instant',
        processingSource: 'ui-fallback',
        chainOptimized: 'SEI',
        fallbackReason: error instanceof Error ? error.message : `${agentName} agent unavailable`,
        agentName: agentName
      }
    }
  }
}

/**
 * Generate smart suggestions based on user message
 */
function generateSmartSuggestions(message: string): string[] {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes('rebalance')) {
    return [
      'Show me current vault utilization',
      'What are the gas costs for rebalancing?',
      'When should I rebalance my position?'
    ]
  }

  if (lowerMessage.includes('predict') || lowerMessage.includes('range')) {
    return [
      'Show AI predictions for optimal ranges',
      'What is the current market volatility?',
      'Help me set liquidity ranges'
    ]
  }

  if (lowerMessage.includes('apy') || lowerMessage.includes('yield')) {
    return [
      'Show historical APY trends',
      'Compare APY across different strategies',
      'How can I improve my yield?'
    ]
  }

  if (lowerMessage.includes('gas') || lowerMessage.includes('cost') || lowerMessage.includes('fee')) {
    return [
      'Show current gas costs on SEI',
      'Compare SEI vs Ethereum gas fees',
      'Estimate transaction costs'
    ]
  }

  // Default suggestions
  return [
    'Analyze my vault performance',
    'Show AI predictions for optimal ranges',
    'What are the current gas costs?'
  ]
}

/**
 * Generate fallback response when agent is unavailable
 */
function generateFallbackResponse(message: string, vaultAddress?: string, agentName: string = 'Kairos'): string {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes('rebalance')) {
    return `🎯 For rebalancing ${vaultAddress ? `vault ${vaultAddress}` : 'your vault'}, I recommend checking the current utilization rate. If it's below 60%, rebalancing could improve fee capture. SEI's 400ms finality makes rebalancing cost-effective at ~$0.15 per transaction.`
  }

  if (lowerMessage.includes('predict') || lowerMessage.includes('range')) {
    return `📊 For optimal range predictions, consider current market volatility and liquidity depth. SEI's fast finality allows for frequent adjustments. Check the AI predictions tab for detailed range recommendations.`
  }

  if (lowerMessage.includes('gas') || lowerMessage.includes('cost')) {
    return `⚡ SEI's advantages: 400ms finality, ~$0.15 gas costs, and parallel execution make it ideal for active liquidity management compared to Ethereum's $50+ rebalancing costs.`
  }

  if (lowerMessage.includes('apy') || lowerMessage.includes('yield')) {
    return `💰 Vault APY depends on fee capture efficiency, range tightness, and rebalancing frequency. Concentrated liquidity can achieve 15-25% APY in optimal conditions on SEI.`
  }

  if (lowerMessage.includes('price') || lowerMessage.includes('sei')) {
    return `📈 You can check real-time SEI price data on the dashboard. The ${agentName} agent can provide detailed market analysis and price predictions when online.`
  }

  if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
    return `👋 I'm ${agentName}, your Yield Delta AI assistant. I can help with vault optimization, rebalancing recommendations, market predictions, gas cost analysis, and APY strategies. Currently running in fallback mode - some features may be limited.`
  }

  return `🤖 I'm ${agentName}, your SEI DLP AI assistant running in fallback mode. I can help with basic vault optimization questions. For advanced AI analysis powered by real-time data, the agent needs to be online. Try asking about rebalancing, gas costs, or APY optimization!`
}