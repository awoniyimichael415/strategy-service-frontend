declare global {
  interface Window {
    ethereum?: any;
    phantom?: any;
  }
}

/* ------------------------------------------
   Wallet Types
------------------------------------------- */
export type WalletType =
  | "MetaMask"
  | "Coinbase Wallet"
  | "WalletConnect"
  | "Phantom"
  | "Unknown";

/* ------------------------------------------
   Detect which wallet is installed
------------------------------------------- */
export const detectWallet = (): WalletType => {
  const eth = window.ethereum;

  // No wallet at all
  if (!eth && !window.phantom) return "Unknown";

  // EVM wallets
  if (eth) {
    if (eth.isMetaMask) return "MetaMask";
    if (eth.isCoinbaseWallet) return "Coinbase Wallet";
    if (eth.isWalletConnect) return "WalletConnect";
    return "MetaMask"; // fallback to MetaMask
  }

  // Phantom wallet
  if (window.phantom?.solana?.isPhantom) return "Phantom";

  return "Unknown";
};

/* ------------------------------------------
   ⚡ Auto redirect user to install MetaMask
------------------------------------------- */
const redirectToMetaMaskInstall = () => {
  window.location.href = "https://metamask.io/download/";
};

/* ------------------------------------------
   Universal wallet connector
------------------------------------------- */
export const connectWallet = async (): Promise<{ wallet: WalletType; address: string }> => {
  const walletType = detectWallet();

  // Phantom wallet
  if (walletType === "Phantom") {
    const res = await window.phantom.solana.connect();
    return { wallet: "Phantom", address: res.publicKey.toString() };
  }

  // No EVM wallet detected → REDIRECT to install MetaMask
  if (!window.ethereum) {
    redirectToMetaMaskInstall();
    throw new Error("Redirecting to install MetaMask...");
  }

  // EVM wallet connect
  try {
    const accounts: string[] = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts returned");
    }

    return { wallet: walletType, address: accounts[0] };
  } catch (err: any) {
    throw new Error(err?.message || "Failed to connect wallet");
  }
};

/* ------------------------------------------
   Legacy MetaMask helpers
------------------------------------------- */
export const connectMetaMask = async (): Promise<string> => {
  if (!window.ethereum) redirectToMetaMaskInstall();

  const accounts: string[] = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  return accounts[0];
};

export const checkMetaMaskConnection = async (): Promise<string | null> => {
  if (!window.ethereum) return null;

  const accounts: string[] = await window.ethereum.request({
    method: "eth_accounts",
  });
  return accounts.length > 0 ? accounts[0] : null;
};

/* ------------------------------------------
   Payment & subscription helpers
------------------------------------------- */
export const sendPayment = async (walletAddress: string, amount: string) => {
  if (!window.ethereum) redirectToMetaMaskInstall();

  const txHash = await window.ethereum.request({
    method: "eth_sendTransaction",
    params: [
      {
        to: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
        from: walletAddress,
        value: amount,
      },
    ],
  });

  return txHash;
};

export const checkSubscription = () => {
  const subscription = localStorage.getItem("subscription");
  if (!subscription) return null;

  const sub = JSON.parse(subscription);
  const now = new Date();
  const endDate = new Date(sub.endDate);

  if (now > endDate) {
    return { ...sub, active: false, expired: true };
  }

  return sub;
};

export const isSubscriptionActive = () => {
  const sub = checkSubscription();
  return sub && sub.active && !sub.expired;
};
