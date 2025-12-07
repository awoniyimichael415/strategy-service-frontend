import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import StrategyGrid from '@/components/StrategyGrid';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, Sparkles, TrendingUp, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { connectMetaMask, checkMetaMaskConnection } from '@/lib/metamask';

const Strategies = () => {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [showLimited, setShowLimited] = useState(true);

  useEffect(() => {
    checkWallet();
  }, []);

  const checkWallet = async () => {
    const address = await checkMetaMaskConnection();
    if (address) {
      setWalletAddress(address);
      setShowLimited(false);
    }
  };

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    try {
      const address = await connectMetaMask();
      setWalletAddress(address);
      setShowLimited(false);
      
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      userData.walletAddress = address;
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (err: any) {
      console.error('Failed to connect wallet:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Trading Strategies</h1>
          <p className="text-muted-foreground">Browse and discover proven trading strategies</p>
        </div>

        {/* Wallet Connection Banner */}
        {!walletAddress && (
          <Card className="mb-8 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Wallet className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1"> Connect Wallet for Personalized Strategies</h3>
                    <p className="text-muted-foreground">
                      Show more strategies based on your preferred tokens
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1 text-sm">
                        <Sparkles className="w-4 h-4 text-yellow-500" />
                        <span>Token-specific strategies</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span>Personalized recommendations</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={handleConnectWallet}
                  disabled={isConnecting}
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
                >
                  {isConnecting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-5 h-5 mr-2" />
                      Connect Wallet
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Connected Wallet Info */}
        {walletAddress && (
          <Alert className="mb-8 border-green-500/50 bg-green-500/10">
            <Sparkles className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700 dark:text-green-400">
              <strong>Wallet Connected!</strong> Showing personalized strategies for {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </AlertDescription>
          </Alert>
        )}

        {/* Limited View Warning */}
        {!walletAddress && (
          <Alert className="mb-8 border-yellow-500/50 bg-yellow-500/10">
            <Lock className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-yellow-700 dark:text-yellow-400">
              <strong>Limited View:</strong> Showing 4 sample strategies. Connect your wallet to unlock all strategies and get personalized recommendations.
            </AlertDescription>
          </Alert>
        )}

        <StrategyGrid limitedView={showLimited} walletAddress={walletAddress} />
      </div>
    </div>
  );
};

export default Strategies;
