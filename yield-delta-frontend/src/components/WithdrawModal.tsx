"use client"

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, ArrowRight, Info, Shield, TrendingDown, X } from 'lucide-react';
import { useWriteContract, useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatEther } from 'viem';
import { useAppStore } from '@/stores/appStore';
import SEIVault from '@/lib/abis/SEIVault';

interface VaultData {
  address: string;
  name: string;
  apy: number;
  tvl: number;
  strategy: string;
  tokenA: string;
  tokenB: string;
  fee: number;
}

interface WithdrawModalProps {
  vault: VaultData | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (txHash: string) => void;
  userShares?: string; // User's current shares in the vault
  userValue?: string; // Current value of user's position
}

const getVaultColor = (strategy: string) => {
  const colors = {
    concentrated_liquidity: '#00f5d4',
    yield_farming: '#9b5de5',
    arbitrage: '#ff206e',
    hedge: '#ffa500',
    stable_max: '#10b981',
    sei_hypergrowth: '#f59e0b',
    blue_chip: '#3b82f6',
    delta_neutral: '#8b5cf6',
  }
  return colors[strategy as keyof typeof colors] || '#00f5d4'
}

export default function WithdrawModal({
  vault,
  isOpen,
  onClose,
  onSuccess,
  userShares = '0',
  userValue = '0'
}: WithdrawModalProps) {
  console.log('[WithdrawModal] Component called with:', { isOpen, vault: vault?.name });
  
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [transactionStatus, setTransactionStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const { address, isConnected } = useAccount();
  const addNotification = useAppStore((state) => state.addNotification);

  const { writeContract, data: hash, error, isError } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError: isReceiptError,
  } = useWaitForTransactionReceipt({
    hash,
    confirmations: 2,
    timeout: 60_000,
  });

  // Set mounted state for client-side rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setWithdrawAmount('');
      setTransactionStatus('idle');
      setErrorMessage(null);
    }
  }, [isOpen]);

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && hash) {
      setTransactionStatus('success');
      addNotification({
        type: 'success',
        title: 'Withdrawal Successful',
        message: `Successfully withdrew from ${vault?.name}`,
      });
      onSuccess(hash);
    }
  }, [isConfirmed, hash, vault?.name, addNotification, onSuccess]);

  // Handle errors
  useEffect(() => {
    if (isError || isReceiptError) {
      setTransactionStatus('error');
      const errorMsg = error?.message || 'Withdrawal failed. Please try again.';
      setErrorMessage(errorMsg);
      addNotification({
        type: 'error',
        title: 'Withdrawal Failed',
        message: errorMsg,
      });
    }
  }, [isError, isReceiptError, error, addNotification]);

  // Debug: Inspect modal DOM when it should be visible
  useEffect(() => {
    if (isOpen && isMounted) {
      setTimeout(() => {
        const modal = document.getElementById('withdraw-modal-overlay');
        console.log('[WithdrawModal] Modal element:', modal);
        if (modal) {
          const rect = modal.getBoundingClientRect();
          const styles = window.getComputedStyle(modal);
          console.log('[WithdrawModal] Modal rect:', rect);
          console.log('[WithdrawModal] Modal styles:', {
            display: styles.display,
            visibility: styles.visibility,
            opacity: styles.opacity,
            position: styles.position,
            zIndex: styles.zIndex,
            top: styles.top,
            left: styles.left,
            width: styles.width,
            height: styles.height,
          });
          console.log('[WithdrawModal] Modal parent:', modal.parentElement);
        }
      }, 200);
    }
  }, [isOpen, isMounted]);

  console.log('[WithdrawModal] Render:', { vault: !!vault, isOpen, isMounted });

  if (!vault) {
    return null;
  }
  
  if (!isOpen) {
    return null;
  }

  // Don't render on server or if not mounted
  if (!isMounted) {
    return null;
  }

  console.log('[WithdrawModal] Rendering modal content');

  const vaultColor = getVaultColor(vault.strategy);

  const handleWithdraw = async () => {
    if (!isConnected || !address) {
      setErrorMessage('Please connect your wallet first');
      return;
    }

    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setErrorMessage('Please enter a valid withdrawal amount');
      return;
    }

    const sharesInWei = parseUnits(withdrawAmount, 18);
    const userSharesInWei = BigInt(userShares);

    if (sharesInWei > userSharesInWei) {
      setErrorMessage('Insufficient shares. You cannot withdraw more than you own.');
      return;
    }

    try {
      setTransactionStatus('pending');
      setErrorMessage(null);

      writeContract({
        address: vault.address as `0x${string}`,
        abi: SEIVault,
        functionName: 'seiOptimizedWithdraw',
        args: [sharesInWei, address as `0x${string}`],
      });
    } catch (err) {
      console.error('Withdrawal error:', err);
      setTransactionStatus('error');
      const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred';
      setErrorMessage(errorMsg);
    }
  };

  const handleMaxWithdraw = () => {
    // Convert userShares from wei to ether for display
    const sharesInEther = formatEther(BigInt(userShares));
    setWithdrawAmount(sharesInEther);
  };

  const userSharesDisplay = parseFloat(formatEther(BigInt(userShares))).toFixed(4);
  const userValueDisplay = parseFloat(userValue).toFixed(2);

  // TEST: Return a super simple modal to verify rendering works
  return (
    <div
      id="withdraw-modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 0, 0, 0.95)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div style={{ background: 'white', padding: '40px', borderRadius: '20px' }}>
        <h2 style={{ color: 'black', fontSize: '24px' }}>WITHDRAW MODAL TEST</h2>
        <p style={{ color: 'black' }}>If you see this, the modal IS rendering!</p>
        <button onClick={onClose} style={{ padding: '10px 20px', marginTop: '20px' }}>Close</button>
      </div>
    </div>
  );

  /* ORIGINAL MODAL CODE - TEMPORARILY DISABLED
  const modalContent = (
    <div
      id="withdraw-modal-overlay"
      className="fixed inset-0 z-[99999] flex items-center justify-center"
      style={{
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(12px)',
      }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl mx-4"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)',
          border: `2px solid ${vaultColor}40`,
          borderRadius: '24px',
          boxShadow: `
            0 0 80px ${vaultColor}30,
            0 20px 60px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.1)
          `,
          maxHeight: '90vh',
          overflow: 'auto',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full transition-all duration-200 hover:bg-white/10"
          style={{ zIndex: 10 }}
        >
          <X className="w-6 h-6 text-white/70 hover:text-white" />
        </button>

        {/* Header */}
        <div className="p-8 pb-6">
          <div className="flex items-center gap-4 mb-4">
            <div
              className="p-3 rounded-xl"
              style={{
                background: `linear-gradient(135deg, ${vaultColor}30, ${vaultColor}15)`,
                border: `1px solid ${vaultColor}40`,
              }}
            >
              <TrendingDown className="w-6 h-6" style={{ color: vaultColor }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Withdraw from Vault</h2>
              <p className="text-sm text-white/60">{vault.name}</p>
            </div>
          </div>

          {/* User Position Summary */}
          <div
            className="p-4 rounded-xl mt-4"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-white/60 mb-1">Your Shares</p>
                <p className="text-lg font-bold text-white">{userSharesDisplay}</p>
              </div>
              <div>
                <p className="text-xs text-white/60 mb-1">Current Value</p>
                <p className="text-lg font-bold" style={{ color: vaultColor }}>${userValueDisplay}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="px-8 pb-8">
          {/* Withdrawal Amount Input */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-white/80">
                Withdrawal Amount (Shares)
              </label>
              <button
                onClick={handleMaxWithdraw}
                className="text-xs font-bold px-4 py-1.5 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${vaultColor}40, ${vaultColor}30)`,
                  border: `1px solid ${vaultColor}60`,
                  color: vaultColor,
                  boxShadow: `0 2px 8px ${vaultColor}20`,
                }}
              >
                MAX
              </button>
            </div>
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="0.0"
              disabled={transactionStatus === 'pending'}
              className="w-full px-5 py-4 rounded-xl text-xl font-semibold text-white bg-white/5 border border-white/10 focus:border-white/30 focus:bg-white/10 focus:outline-none transition-all duration-200 placeholder:text-white/30"
              style={{
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
              }}
            />
            <p className="text-xs text-white/50 mt-2">
              Available: {userSharesDisplay} shares
            </p>
          </div>

          {/* Info Card */}
          <div
            className="p-4 rounded-xl mb-6"
            style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
            }}
          >
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-white/80">
                <p className="mb-2">Withdrawing shares will convert them back to your deposited tokens. The value may have changed based on vault performance.</p>
                <p className="text-xs text-white/60">Current APY: {(vault.apy * 100).toFixed(2)}%</p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div
              className="p-4 rounded-xl mb-6"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              <p className="text-sm text-red-400">{errorMessage}</p>
            </div>
          )}

          {/* Transaction Status */}
          {transactionStatus === 'pending' && (
            <div
              className="p-4 rounded-xl mb-6 flex items-center gap-3"
              style={{
                background: `linear-gradient(135deg, ${vaultColor}20, ${vaultColor}10)`,
                border: `1px solid ${vaultColor}40`,
              }}
            >
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: vaultColor }} />
              <div>
                <p className="text-sm font-medium text-white">
                  {isConfirming ? 'Confirming withdrawal...' : 'Processing withdrawal...'}
                </p>
                <p className="text-xs text-white/60">Please wait while your transaction is confirmed</p>
              </div>
            </div>
          )}

          {transactionStatus === 'success' && (
            <div
              className="p-4 rounded-xl mb-6 flex items-center gap-3"
              style={{
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
              }}
            >
              <Shield className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-sm font-medium text-white">Withdrawal successful!</p>
                <p className="text-xs text-white/60">Your tokens have been returned to your wallet</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={onClose}
              disabled={transactionStatus === 'pending'}
              className="flex-1 px-6 py-4 rounded-xl font-semibold text-white transition-all duration-200 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleWithdraw}
              disabled={
                !isConnected ||
                transactionStatus === 'pending' ||
                transactionStatus === 'success' ||
                !withdrawAmount ||
                parseFloat(withdrawAmount) <= 0
              }
              className="flex-1 px-6 py-4 rounded-xl font-bold transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{
                background: `linear-gradient(135deg, ${vaultColor}, ${vaultColor}DD)`,
                color: '#000000',
                boxShadow: `0 0 30px ${vaultColor}40, 0 4px 12px rgba(0, 0, 0, 0.3)`,
                border: `1px solid ${vaultColor}`,
              }}
            >
              {transactionStatus === 'pending' ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </span>
              ) : transactionStatus === 'success' ? (
                'Withdrawn!'
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Withdraw
                  <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  console.log('[WithdrawModal] modalContent created:', !!modalContent);
  console.log('[WithdrawModal] About to return modalContent');
  
  // Render modal directly (portal was causing issues)
  return modalContent;
  */
}
