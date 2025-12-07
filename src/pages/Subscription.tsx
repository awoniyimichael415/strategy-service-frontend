import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import ErrorModal from '@/components/ErrorModal';
import SuccessModal from '@/components/SuccessModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Wallet, AlertCircle, Sparkles, Crown, Zap, Shield, TrendingUp, Lock, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { connectMetaMask, checkMetaMaskConnection, sendPayment, checkSubscription } from '@/lib/metamask';

interface User {
  walletAddress?: string;
  [key: string]: unknown;
}

interface Subscription {
  active: boolean;
  isTrial: boolean;
  startDate: string;
  endDate: string;
  plan: string;
  txHash?: string;
  walletAddress?: string;
  amount?: string;
  expired?: boolean;
}

interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
}

interface SuccessModalState extends ModalState {
  isPremium: boolean;
}

const Subscription = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isPaying, setIsPaying] = useState<boolean>(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<Subscription | null>(null);
  
  // Modal states
  const [errorModal, setErrorModal] = useState<ModalState>({ isOpen: false, title: '', message: '' });
  const [successModal, setSuccessModal] = useState<SuccessModalState>({ isOpen: false, title: '', message: '', isPremium: false });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    const sub = checkSubscription();
    if (sub) {
      setSubscriptionStatus(sub);
    }
    
    initWallet();
  }, []);

  const initWallet = async () => {
    const address = await checkMetaMaskConnection();
    if (address) {
      setWalletAddress(address);
    }
  };

  const handleConnectWallet = async (): Promise<void> => {
    setIsConnecting(true);
    
    try {
      const address = await connectMetaMask();
      setWalletAddress(address);
      
      const userData: User = JSON.parse(localStorage.getItem('user') || '{}');
      userData.walletAddress = address;
      localStorage.setItem('user', JSON.stringify(userData));
      
    } catch (err) {
      const error = err as Error;
      setErrorModal({
        isOpen: true,
        title: 'Connection Failed',
        message: error.message || 'Failed to connect MetaMask. Please make sure MetaMask is installed and try again.'
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleFreeTrial = async (): Promise<void> => {
    setIsConnecting(true);

    try {
      const subscription: Subscription = {
        active: true,
        isTrial: true,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        plan: 'Free Trial'
      };
      
      localStorage.setItem('subscription', JSON.stringify(subscription));
      
      setSuccessModal({
        isOpen: true,
        title: '🎉 Free Trial Activated!',
        message: 'Your 30-day free trial has been activated successfully. You now have access to professional trading strategies. Connect your wallet on the strategies page to see personalized recommendations!',
        isPremium: false
      });
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (err) {
      const error = err as Error;
      setErrorModal({
        isOpen: true,
        title: 'Activation Failed',
        message: error.message || 'Failed to activate free trial. Please try again.'
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handlePayment = async (): Promise<void> => {
    setIsPaying(true);

    try {
      // Auto-connect MetaMask if not connected
      let address = walletAddress;
      if (!address) {
        address = await connectMetaMask();
        setWalletAddress(address);
        
        const userData: User = JSON.parse(localStorage.getItem('user') || '{}');
        userData.walletAddress = address;
        localStorage.setItem('user', JSON.stringify(userData));
      }

      // $50 ≈ 0.02 ETH (adjust based on current ETH price)
      const paymentAmount = '0x470DE4DF820000'; // 0.02 ETH in hex wei
      
      const txHash = await sendPayment(address, paymentAmount);

      const subscription: Subscription = {
        active: true,
        isTrial: false,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        txHash: txHash,
        walletAddress: address,
        plan: 'Premium',
        amount: '$50'
      };
      
      localStorage.setItem('subscription', JSON.stringify(subscription));
      
      setSuccessModal({
        isOpen: true,
        title: '👑 Welcome to Premium!',
        message: 'Payment successful! You now have access to 50+ professional strategies, AI recommendations, personal coaching, and all premium features. Let\'s start trading!',
        isPremium: true
      });
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2500);
      
    } catch (err) {
      const error = err as Error;
      let errorMessage = 'Payment failed. Please try again.';
      
      if (error.message.includes('User rejected')) {
        errorMessage = 'Transaction was cancelled. No payment was made.';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds in your wallet. Please add more ETH and try again.';
      } else if (error.message.includes('MetaMask')) {
        errorMessage = 'MetaMask is not installed. Please install MetaMask extension and try again.';
      }
      
      setErrorModal({
        isOpen: true,
        title: 'Payment Failed',
        message: errorMessage
      });
    } finally {
      setIsPaying(false);
    }
  };

  const freeTrialFeatures = [
    'Access to 12 professional trading strategies',
    'Real-time backtesting results',
    'Basic algorithm details',
    'Community discussions',
    'Portfolio tracking dashboard',
    'Strategy download scripts',
    'Email support',
    '30-day trial period'
  ];

  const premiumFeatures = [
    'Access to 50+ professional trading strategies',
    '2 NEW strategies added DAILY',
    'Real-time backtesting with live data',
    'Advanced algorithm details & source code',
    'AI-powered strategy recommendations',
    'Custom strategy builder tool',
    'Automated trading bot integration',
    'Advanced risk management tools',
    'Real-time market alerts & signals',
    'Priority 24/7 support',
    'Private community & expert webinars',
    'Monthly performance reports & analytics',
    'API access for custom integrations',
    'Multi-exchange support',
    'Advanced portfolio optimization',
    'Tax reporting & documentation',
    'Lifetime access to all future strategies',
    'Early access to new features',
    'Personal trading coach (monthly call)'
  ];

  const eliteFeatures = [
    'Everything in Premium PLUS:',
    'Access to 100+ elite trading strategies',
    '5 NEW strategies added DAILY',
    'Exclusive institutional-grade algorithms',
    'Dedicated personal trading coach (weekly calls)',
    'Custom strategy development service',
    'White-label trading bot',
    'Priority algorithm requests',
    'Advanced AI portfolio manager',
    'Hedge fund-level risk analytics',
    'Direct access to strategy developers',
    'VIP community & networking events',
    'Quarterly in-person workshops',
    'Unlimited API calls',
    'Multi-account management',
    'Professional tax consultation',
    'Lifetime premium support',
    'Revenue sharing opportunities'
  ];

  return (
    <div className="min-h-screen bg-background">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--muted-foreground) / 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground) / 0.5);
        }
      `}</style>
      <Header />
      <div className="container mx-auto px-4 py-12">
        {/* Current Subscription Status */}
        {subscriptionStatus && subscriptionStatus.active && !subscriptionStatus.expired && (
          <Alert className="mb-8 max-w-4xl mx-auto border-green-500/50 bg-green-500/10">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700 dark:text-green-400">
              <div className="flex items-center justify-between">
                <div>
                  <strong>Current Plan: {subscriptionStatus.plan || (subscriptionStatus.isTrial ? 'Free Trial' : 'Premium')}</strong>
                  <p className="text-sm mt-1">
                    Active until {new Date(subscriptionStatus.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-sm">
                  Want more features? Upgrade below! 👇
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Premium Trading Platform</span>
          </div>
          <h1 className="text-5xl font-bold mb-4">
            {subscriptionStatus && subscriptionStatus.active ? 'Upgrade Your Plan' : 'Choose Your Plan'}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {subscriptionStatus && subscriptionStatus.active 
              ? 'Unlock more strategies and premium features with an upgrade'
              : 'Get access to professional trading strategies and start your journey to financial freedom'
            }
          </p>
        </div>

        {/* Modals */}
        <ErrorModal
          isOpen={errorModal.isOpen}
          onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
          title={errorModal.title}
          message={errorModal.message}
        />
        
        <SuccessModal
          isOpen={successModal.isOpen}
          onClose={() => {
            setSuccessModal({ ...successModal, isOpen: false });
            navigate('/dashboard');
          }}
          title={successModal.title}
          message={successModal.message}
          isPremium={successModal.isPremium}
        />

        {/* Info Alert */}
        <Alert className="mb-8 max-w-2xl mx-auto border-blue-500/50 bg-blue-500/10">
          <Sparkles className="h-4 h-4 text-blue-500" />
          <AlertDescription className="text-blue-700 dark:text-blue-400">
            <strong>No wallet required to start!</strong> Connect your wallet later on the strategies page to get personalized recommendations based on your tokens.
          </AlertDescription>
        </Alert>

        {/* Feature Comparison Table */}
        <div className="max-w-5xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-center mb-6">Compare Plans</h2>
          <div className="grid grid-cols-4 gap-3 text-sm">
            <div className="font-semibold">Feature</div>
            <div className="text-center font-semibold text-blue-600">Free Trial</div>
            <div className="text-center font-semibold text-yellow-600">Premium</div>
            <div className="text-center font-semibold text-purple-600">Elite</div>
            
            <div className="col-span-4 border-t pt-2"></div>
            
            <div>Trading Strategies</div>
            <div className="text-center">12</div>
            <div className="text-center font-bold text-yellow-600">50+</div>
            <div className="text-center font-bold text-purple-600">100+</div>
            
            <div>New Strategies Daily</div>
            <div className="text-center text-red-500">✗</div>
            <div className="text-center font-bold text-yellow-600">2/day</div>
            <div className="text-center font-bold text-purple-600">5/day</div>
            
            <div>Algorithm Details</div>
            <div className="text-center">Basic</div>
            <div className="text-center">Advanced</div>
            <div className="text-center font-bold text-purple-600">Institutional</div>
            
            <div>AI Recommendations</div>
            <div className="text-center text-red-500">✗</div>
            <div className="text-center text-green-500">✓</div>
            <div className="text-center text-green-500">✓</div>
            
            <div>Trading Bot</div>
            <div className="text-center text-red-500">✗</div>
            <div className="text-center text-green-500">✓</div>
            <div className="text-center font-bold text-purple-600">White-label</div>
            
            <div>API Access</div>
            <div className="text-center text-red-500">✗</div>
            <div className="text-center">Limited</div>
            <div className="text-center font-bold text-purple-600">Unlimited</div>
            
            <div>Support</div>
            <div className="text-center">Email</div>
            <div className="text-center">24/7 Priority</div>
            <div className="text-center font-bold text-purple-600">VIP Dedicated</div>
            
            <div>Personal Coach</div>
            <div className="text-center text-red-500">✗</div>
            <div className="text-center">Monthly</div>
            <div className="text-center font-bold text-purple-600">Weekly</div>
          </div>
        </div>

        {/* Pricing Cards - Always visible */}
        {(
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
            {/* Free Trial Card */}
            <Card className="relative overflow-hidden border-2 hover:shadow-2xl transition-all duration-300">
              <div className="absolute top-0 right-0 bg-gradient-to-br from-blue-500 to-cyan-500 text-white px-4 py-1 text-sm font-semibold">
                RECOMMENDED
              </div>
              <CardHeader className="text-center pt-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-3xl">Free Trial</CardTitle>
                <CardDescription className="text-lg">Perfect to get started</CardDescription>
                <div className="mt-4">
                  <span className="text-5xl font-bold">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleFreeTrial}
                  disabled={isConnecting || (subscriptionStatus && subscriptionStatus.active)}
                  className="w-full mb-6"
                  size="lg"
                >
                  {isConnecting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Activating...
                    </>
                  ) : subscriptionStatus && subscriptionStatus.active ? (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Current Plan
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      Start Free Trial
                    </>
                  )}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  {subscriptionStatus && subscriptionStatus.active 
                    ? 'You already have this plan'
                    : 'No wallet connection required • Instant access'
                  }
                </p>
                
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {freeTrialFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <p className="text-xs text-center text-blue-600 dark:text-blue-400 font-medium">
                    Perfect for beginners to explore and learn
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Premium Card */}
            <Card className="relative overflow-hidden border-2 border-yellow-500/50 hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-yellow-500/5 to-orange-500/5">
              <div className="absolute top-0 right-0 bg-gradient-to-br from-yellow-500 to-orange-500 text-white px-4 py-1 text-sm font-semibold flex items-center gap-1">
                <Crown className="w-4 h-4" />
                MOST POPULAR
              </div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500"></div>
              <CardHeader className="text-center pt-8">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
                  <Crown className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-3xl">Premium</CardTitle>
                <CardDescription className="text-lg font-semibold">For serious traders</CardDescription>
                <div className="mt-4">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl text-muted-foreground line-through">$99</span>
                    <span className="text-5xl font-bold">$50</span>
                  </div>
                  <span className="text-muted-foreground">/month</span>
                  <p className="text-xs text-green-500 font-semibold mt-1">Save 50% - Limited Time!</p>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Billed monthly via MetaMask</p>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handlePayment}
                  disabled={isPaying}
                  className="w-full mb-6 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                  size="lg"
                >
                  {isPaying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-5 h-5 mr-2" />
                      Upgrade to Premium
                    </>
                  )}
                </Button>
                
                <div className="space-y-2.5 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                  {premiumFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                      <span className="text-sm font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-yellow-600" />
                      <p className="text-xs font-bold text-yellow-600 dark:text-yellow-400">
                        EXCLUSIVE PREMIUM BENEFITS
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Get 4x more strategies, AI recommendations, and personal coaching
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-muted rounded">
                      <p className="text-lg font-bold text-yellow-600">50+</p>
                      <p className="text-xs text-muted-foreground">Strategies</p>
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <p className="text-lg font-bold text-yellow-600">24/7</p>
                      <p className="text-xs text-muted-foreground">Support</p>
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <p className="text-lg font-bold text-yellow-600">API</p>
                      <p className="text-xs text-muted-foreground">Access</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Elite Card */}
            <Card className="relative overflow-hidden border-2 border-purple-500/50 hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-red-500/10 transform md:scale-105">
              <div className="absolute top-0 right-0 bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 text-white px-4 py-1 text-sm font-semibold flex items-center gap-1">
                <Zap className="w-4 h-4" />
                ELITE
              </div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600"></div>
              <CardHeader className="text-center pt-8">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-3xl">Elite</CardTitle>
                <CardDescription className="text-lg font-semibold">For professional traders</CardDescription>
                <div className="mt-4">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl text-muted-foreground line-through">$199</span>
                    <span className="text-5xl font-bold">$99</span>
                  </div>
                  <span className="text-muted-foreground">/month</span>
                  <p className="text-xs text-purple-500 font-semibold mt-1">5 strategies daily!</p>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Billed monthly via MetaMask</p>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handlePayment}
                  disabled={isPaying}
                  className="w-full mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700"
                  size="lg"
                >
                  {isPaying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      Upgrade to Elite
                    </>
                  )}
                </Button>
                
                <div className="space-y-2.5 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                  {eliteFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                      <span className={`text-sm ${index === 0 ? 'font-bold text-purple-600' : 'font-medium'}`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <p className="text-xs font-bold text-purple-600 dark:text-purple-400">
                        ELITE EXCLUSIVE BENEFITS
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Institutional-grade tools, personal coach, and revenue sharing
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-muted rounded">
                      <p className="text-lg font-bold text-purple-600">100+</p>
                      <p className="text-xs text-muted-foreground">Strategies</p>
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <p className="text-lg font-bold text-purple-600">5/day</p>
                      <p className="text-xs text-muted-foreground">New Daily</p>
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <p className="text-lg font-bold text-purple-600">VIP</p>
                      <p className="text-xs text-muted-foreground">Support</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}



        {/* Value Proposition */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">Why Choose Premium?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold mb-2">4x More Strategies</h3>
                <p className="text-sm text-muted-foreground">
                  Access 50+ professional strategies vs 12 in free trial. More options = better opportunities.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold mb-2">AI-Powered Tools</h3>
                <p className="text-sm text-muted-foreground">
                  Get personalized strategy recommendations and automated trading bot integration.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold mb-2">Personal Coaching</h3>
                <p className="text-sm text-muted-foreground">
                  Monthly 1-on-1 calls with expert traders to optimize your strategy and results.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ROI Calculator */}
        <div className="max-w-2xl mx-auto mb-12">
          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Premium ROI Calculator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Monthly Investment:</span>
                  <span className="text-lg font-bold">$50</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Average Strategy Return:</span>
                  <span className="text-lg font-bold text-green-500">+22.4%/month</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">On $1,000 capital:</span>
                  <span className="text-lg font-bold text-green-500">+$224/month</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Net Profit (after subscription):</span>
                    <span className="text-2xl font-bold text-green-500">+$174/month</span>
                  </div>
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    That's a 348% ROI on your subscription! 
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Notice */}
        <div className="max-w-2xl mx-auto mt-12 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-4 h-4" />
            <span className="font-semibold">Secure Payment</span>
          </div>
          <p>
            All payments are processed securely through MetaMask. We never store your private keys or sensitive information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
