import { Address, Blockfrost, Datum, Lucid, UTxO } from 'lucid-cardano';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface LucidContextType {
    address: Address | null;
    lucid: Lucid | null;
    walletType: string | null;

    connectWallet: (walletName: string) => Promise<void>;
    disconnectWallet: () => void;
    getUTxOs: (address: string) => Promise<UTxO[]>;
    getDatum: (datumHash: string) => Promise<Datum>;
}

const LucidContext = createContext<LucidContextType | undefined>(undefined);

export function LucidProvider({ children }: { children: ReactNode }) {
    const [address, setAddress] = useState<Address | null>(null);
    const [lucid, setLucid] = useState<Lucid | null>(null);
    const [walletType, setWalletType] = useState<string | null>(null);

    useEffect(() => {
        const initLucid = async () => {
            try {
                const lucidInstance = await Lucid.new(
                    new Blockfrost("https://cardano-preview.blockfrost.io/api/v0", "previewtrL4xwCSqoGVmbObx1jskCiGVs1KVn8O"),
                    "Preview",
                );
                setLucid(lucidInstance);

            } catch (error) {
                console.error("Failed to initialize Lucid:", error);
            }
        }
        initLucid();
    }, []);

    const connectWallet = async (walletName: string) => {
        if (!lucid) {
            throw new Error("Lucid is not initialized");
        }

        try {
            let walletApi;

            switch (walletName.toLowerCase()) {
                case 'nami':
                    if (!window.cardano.nami) throw new Error("Nami wallet not installed");
                    walletApi = await window.cardano.nami.enable();
                    break;
                case 'eternl':
                    if (!window.cardano.eternl) throw new Error("Eternl wallet not installed");
                    walletApi = await window.cardano.eternl.enable();
                    break;
                case 'flint':
                    if (!window.cardano.flint) throw new Error("Flint wallet not installed");
                    walletApi = await window.cardano.flint.enable();
                    break;
                default:
                    throw new Error("Unsupported wallet");
            }

            lucid.selectWallet(walletApi);
            const walletAddress = await lucid.wallet.address();
            setAddress(walletAddress);
            setWalletType(walletName);
        } catch (error) {
            console.error(`Failed to connect ${walletName} wallet:`, error);
            throw error;
        }
    }

    const disconnectWallet = () => {
        setAddress(null);
        setWalletType(null);
    }

    const getUTxOs = async (address: string) => {
        if (!lucid) {
            throw new Error("Lucid is not initialized");
        }
        return await lucid.utxosAt(address);
    }

    const getDatum = async (datumHash: string) => {
        if (!lucid) {
            throw new Error("Lucid is not initialized");
        }
        return await lucid.provider.getDatum(datumHash);
    }

    return (
        <LucidContext.Provider value={{
            lucid,
            connectWallet,
            disconnectWallet,
            address,
            walletType,
            getUTxOs,
            getDatum
        }}>
            {children}
        </LucidContext.Provider>
    );
}

export function useLucid() {
    const context = useContext(LucidContext);
    if (context === undefined) {
        throw new Error('useLucid must be used within a LucidProvider');
    }
    return context;
}
