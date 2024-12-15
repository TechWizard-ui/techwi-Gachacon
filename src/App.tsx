import { GachaGame } from './components/GachaGame';
import { WalletConnect } from './components/WalletConnect';
import { LucidProvider } from './context/LucidProvider';

function App() {
  return (
    <LucidProvider>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <WalletConnect />
          <GachaGame
            pullCost={5}
            treasuryAddress="addr_test1qq4uxwv55dqwufts3md0g9r6rn4vys3c3yjrzz4jfk8wcmh3kxqgjchqfdjzccnzrx8cuyce96pc7hhn8pthpk9k46xqput4ca"
            onPullComplete={() => {

            }}
          />
        </div>
      </div>
    </LucidProvider>
  );
}

export default App;
