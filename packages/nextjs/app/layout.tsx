import "@rainbow-me/rainbowkit/styles.css";
import { AppWithProviders } from "~~/components/AppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/web3/metadata";

export const metadata = getMetadata({
  title: "SplitWiseX App",
  description: "Built with Web3 and Oasis Sapphire",
});

const App = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning className={``}>
      <body suppressHydrationWarning={true}>
        <ThemeProvider enableSystem>
          <AppWithProviders>{children}</AppWithProviders>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default App;
