import { Button } from "@/components/ui/button";
import { TrendingUp, User, Crown, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { checkSubscription, connectWallet } from "@/lib/metamask";

const Header = () => {
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);

  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }

    const sub = checkSubscription();
    setSubscription(sub);

    // Load saved wallet if previously connected
    const savedAddress = localStorage.getItem("walletAddress");
    const savedType = localStorage.getItem("walletType");
    if (savedAddress && savedType) {
      setWalletAddress(savedAddress);
      setWalletType(savedType);
    }
  }, []);

  const handleWalletConnect = async () => {
    try {
      const result = await connectWallet();

      setWalletAddress(result.address);
      setWalletType(result.wallet);

      localStorage.setItem("walletAddress", result.address);
      localStorage.setItem("walletType", result.wallet);
    } catch (err: any) {
      console.error(err);

      // Allow MetaMask auto-install redirect to proceed
      if (err.message?.includes("Redirecting to install MetaMask")) {
        return;
      }

      alert(err.message || "Wallet connection failed.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <TrendingUp className="w-8 h-8 text-primary" />
          <span className="text-2xl font-bold">TradexStrategies</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <Link to="/strategies" className="text-muted-foreground hover:text-foreground transition-colors">
            Strategies
          </Link>
          <Link to="/subscription" className="text-muted-foreground hover:text-foreground transition-colors">
            Subscription
          </Link>
          <Link to="/community" className="text-muted-foreground hover:text-foreground transition-colors">
            Community
          </Link>
          <Link to="/profile" className="text-muted-foreground hover:text-foreground transition-colors">
            Profile
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {subscription && subscription.active && !subscription.expired && (
                <Link to="/subscription">
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
                      subscription.isTrial
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        : "bg-gradient-to-r from-yellow-500/10 to-orange-500/10 text-yellow-600 dark:text-yellow-400"
                    }`}
                  >
                    {subscription.isTrial ? (
                      <>
                        <Sparkles className="w-3 h-3" />
                        Free Trial
                      </>
                    ) : (
                      <>
                        <Crown className="w-3 h-3" />
                        Premium
                      </>
                    )}
                  </div>
                </Link>
              )}

              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4" />
                <span>{user.name}</span>
              </div>

              {/* Wallet UI (Added but layout untouched) */}
              {walletAddress ? (
                <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  {walletType}: {walletAddress.slice(0, 6)}...
                  {walletAddress.slice(-4)}
                </div>
              ) : (
                <Button variant="outline" onClick={handleWalletConnect}>
                  Connect Wallet
                </Button>
              )}

              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
