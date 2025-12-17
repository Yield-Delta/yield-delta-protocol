# Testnet Indicators - Code Examples

Quick reference for using the testnet indicator system in your components.

## Import the Utilities

```typescript
import { isTestnetChain, getChainDisplayName } from '@/lib/chainUtils';
import { useAccount } from 'wagmi';
```

## Check if User is on Testnet

```typescript
function MyComponent() {
  const { chain } = useAccount();
  const isTestnet = chain ? isTestnetChain(chain.id) : false;

  if (isTestnet) {
    // Show testnet-specific UI or warnings
  }
}
```

## Display Chain Name with Testnet Indicator

```typescript
function NetworkDisplay() {
  const { chain } = useAccount();

  if (!chain) return <span>Not connected</span>;

  return (
    <span className={isTestnetChain(chain.id) ? 'text-amber-400' : 'text-blue-400'}>
      {getChainDisplayName(chain.id)}
    </span>
  );
}
```

## Add TestnetBanner to a Page

```typescript
import TestnetBanner from '@/components/TestnetBanner';

export default function MyPage() {
  return (
    <div>
      {/* Banner variant - full width below nav */}
      <TestnetBanner variant="banner" />

      {/* OR Badge variant - floating bottom-right */}
      <TestnetBanner variant="badge" />

      {/* Page content */}
    </div>
  );
}
```

## Conditional Rendering Based on Network

```typescript
function VaultCard() {
  const { chain } = useAccount();
  const isTestnet = chain ? isTestnetChain(chain.id) : true;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          My Vault
          {isTestnet && (
            <Badge variant="warning" className="ml-2">
              Testnet
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isTestnet && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Testnet Mode</AlertTitle>
            <AlertDescription>
              This vault is on testnet. Funds are not real.
            </AlertDescription>
          </Alert>
        )}
        {/* Rest of card content */}
      </CardContent>
    </Card>
  );
}
```

## Custom Button Styling for Testnet

```typescript
function TransactionButton() {
  const { chain } = useAccount();
  const isTestnet = chain ? isTestnetChain(chain.id) : false;

  return (
    <Button
      className={isTestnet ? 'btn-cyber-warning' : 'btn-cyber'}
      onClick={handleTransaction}
    >
      {isTestnet ? 'Execute Test Transaction' : 'Execute Transaction'}
    </Button>
  );
}
```

## Show Network-Specific Messages

```typescript
function NetworkMessage() {
  const { chain } = useAccount();

  if (!chain) {
    return <p>Please connect your wallet</p>;
  }

  switch (chain.id) {
    case 1329: // SEI Mainnet
      return (
        <Alert variant="success">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Connected to SEI Mainnet - Transactions use real funds
          </AlertDescription>
        </Alert>
      );

    case 1328: // SEI Testnet
      return (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Connected to SEI Atlantic-2 Testnet - Test environment
          </AlertDescription>
        </Alert>
      );

    case 713715: // SEI Devnet
      return (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Connected to SEI Arctic-1 Devnet - Development environment
          </AlertDescription>
        </Alert>
      );

    default:
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unsupported network. Please switch to SEI network.
          </AlertDescription>
        </Alert>
      );
  }
}
```

## Block Mainnet Actions in Development

```typescript
import { isTestnetEnvironment } from '@/lib/chainUtils';

function AdminPanel() {
  const canAccessProduction = !isTestnetEnvironment();

  return (
    <div>
      <h2>Admin Panel</h2>
      {canAccessProduction ? (
        <Button onClick={handleProductionAction}>
          Deploy to Production
        </Button>
      ) : (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Production actions disabled in testnet environment
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
```

## Chain-Specific Configuration

```typescript
import { getBlockExplorerUrl } from '@/lib/chainUtils';

function TransactionLink({ hash }: { hash: string }) {
  const { chain } = useAccount();

  if (!chain) return null;

  const explorerUrl = getBlockExplorerUrl(chain.id);

  return (
    <a
      href={`${explorerUrl}/tx/${hash}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary hover:underline"
    >
      View on {isTestnetChain(chain.id) ? 'Testnet ' : ''}Explorer
    </a>
  );
}
```

## Wallet Network Indicator Component

```typescript
function WalletNetworkIndicator() {
  const { chain, isConnected } = useAccount();

  if (!isConnected || !chain) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-2 h-2 rounded-full ${
          isTestnetChain(chain.id)
            ? 'bg-amber-400 animate-pulse'
            : 'bg-green-400'
        }`}
      />
      <span className="text-sm font-medium">
        {getChainDisplayName(chain.id)}
      </span>
    </div>
  );
}
```

## Modal with Network Warning

```typescript
function DepositModal() {
  const { chain } = useAccount();
  const isTestnet = chain ? isTestnetChain(chain.id) : false;

  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deposit Funds</DialogTitle>
        </DialogHeader>

        {isTestnet && (
          <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p className="text-sm text-amber-200 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              You are depositing testnet tokens. These have no real value.
            </p>
          </div>
        )}

        {/* Rest of modal content */}
      </DialogContent>
    </Dialog>
  );
}
```

## Toast Notification with Network Context

```typescript
import { toast } from 'sonner';

function handleTransaction() {
  const { chain } = useAccount();
  const isTestnet = chain ? isTestnetChain(chain.id) : false;

  // Show different toasts for testnet vs mainnet
  if (isTestnet) {
    toast.warning('Testnet Transaction', {
      description: 'This is a test transaction using fake tokens',
    });
  } else {
    toast.info('Mainnet Transaction', {
      description: 'This will use real funds. Please confirm carefully.',
    });
  }

  // Proceed with transaction...
}
```

## Environment-Based Feature Flags

```typescript
import { isTestnetEnvironment } from '@/lib/chainUtils';

function ExperimentalFeature() {
  const showExperimentalFeatures = isTestnetEnvironment();

  if (!showExperimentalFeatures) {
    return null; // Hide experimental features on mainnet
  }

  return (
    <div className="border-2 border-amber-500 p-4 rounded-lg">
      <Badge variant="warning" className="mb-2">
        Experimental - Testnet Only
      </Badge>
      {/* Experimental feature content */}
    </div>
  );
}
```

## Complete Example: Transaction Form

```typescript
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { isTestnetChain } from '@/lib/chainUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export function TransactionForm() {
  const [amount, setAmount] = useState('');
  const { chain, isConnected } = useAccount();
  const isTestnet = chain ? isTestnetChain(chain.id) : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    // Show confirmation for mainnet transactions
    if (!isTestnet) {
      const confirmed = window.confirm(
        'This is a MAINNET transaction with REAL funds. Are you sure?'
      );
      if (!confirmed) return;
    }

    // Process transaction...
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Network indicator */}
      {isConnected && (
        <Alert variant={isTestnet ? 'warning' : 'default'}>
          {isTestnet ? (
            <>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Testnet Mode - Using test tokens
              </AlertDescription>
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Mainnet - Real transactions
              </AlertDescription>
            </>
          )}
        </Alert>
      )}

      {/* Amount input */}
      <Input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount"
      />

      {/* Submit button with network-appropriate styling */}
      <Button
        type="submit"
        className={isTestnet ? 'btn-cyber-warning' : 'btn-cyber'}
        disabled={!isConnected}
      >
        {isTestnet ? 'Test Transaction' : 'Send Transaction'}
      </Button>
    </form>
  );
}
```

## TypeScript Type Definitions

```typescript
// Type guard for chain detection
function assertTestnet(chainId: number | undefined): asserts chainId is 1328 | 713715 {
  if (!chainId || !isTestnetChain(chainId)) {
    throw new Error('Expected testnet chain');
  }
}

// Usage
try {
  assertTestnet(chain?.id);
  // TypeScript now knows chain.id is 1328 or 713715
  console.log('Confirmed testnet');
} catch (error) {
  console.log('Not on testnet');
}
```

## React Hook for Network Detection

```typescript
import { useMemo } from 'react';
import { useAccount } from 'wagmi';
import { isTestnetChain, getChainDisplayName } from '@/lib/chainUtils';

export function useNetworkInfo() {
  const { chain, isConnected } = useAccount();

  return useMemo(() => ({
    isConnected,
    chainId: chain?.id,
    isTestnet: chain ? isTestnetChain(chain.id) : false,
    displayName: chain ? getChainDisplayName(chain.id) : 'Not connected',
    isMainnet: chain?.id === 1329,
    isAtlantic2: chain?.id === 1328,
    isArctic1: chain?.id === 713715,
  }), [chain, isConnected]);
}

// Usage
function MyComponent() {
  const network = useNetworkInfo();

  return (
    <div>
      <p>Network: {network.displayName}</p>
      {network.isTestnet && <Badge>Testnet</Badge>}
    </div>
  );
}
```

## CSS Classes Reference

```typescript
// Available testnet-related CSS classes:

<div className="btn-cyber-warning">      {/* Amber warning button */}
<div className="animate-pulse-subtle">   {/* Subtle pulse animation */}
<div className="animate-shimmer">        {/* Shimmer effect */}

// Color utilities:
<div className="text-amber-400">         {/* Testnet text color */}
<div className="bg-amber-500/20">        {/* Testnet background */}
<div className="border-amber-500/40">    {/* Testnet border */}
```

---

## Best Practices

1. **Always check for connected wallet before using chain**
   ```typescript
   const { chain } = useAccount();
   if (!chain) return null; // or show "connect wallet" message
   ```

2. **Provide fallbacks for undefined states**
   ```typescript
   const isTestnet = chain ? isTestnetChain(chain.id) : true; // Default to testnet for safety
   ```

3. **Use consistent warning colors**
   - Testnet: Amber/Orange (`text-amber-400`, `bg-amber-500/20`)
   - Mainnet: Blue/Purple (default theme colors)
   - Error: Red (`text-destructive`)

4. **Add tooltips for user education**
   ```typescript
   <Button title="Testnet - Not real money">
     SEI Testnet
   </Button>
   ```

5. **Make critical actions require confirmation on mainnet**
   ```typescript
   if (!isTestnet) {
     const confirmed = confirm('This uses real funds. Confirm?');
     if (!confirmed) return;
   }
   ```

---

**Last Updated:** 2025-12-17
**Version:** 1.0.0
