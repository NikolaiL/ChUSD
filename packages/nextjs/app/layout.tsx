import "@rainbow-me/rainbowkit/styles.css";
import type { Metadata } from "next";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import { MiniKitContextProvider } from "~~/providers/MiniKitProvider";
import "~~/styles/globals.css";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Pika chUSD",
    description:
      "Experience Pikachu's moods change based on the price of ETH. Deposit ETH and mint ChUSD stablecoin with live price data on Base.",
    other: {
      "fc:frame": JSON.stringify({
        version: "next",
        imageUrl: "https://pikachusd.vercel.app/image.png",
        button: {
          title: "Launch Pika chUSD",
          action: {
            type: "launch_frame",
            name: "Pika chUSD",
            url: "https://pikachusd.vercel.app",
            splashImageUrl: "https://pikachusd.vercel.app/splash.png",
            splashBackgroundColor: "#f5f0d9",
          },
        },
      }),
    },
  };
}

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning className={``}>
      <body>
        <MiniKitContextProvider>
          <ThemeProvider enableSystem>
            <ScaffoldEthAppWithProviders>{children}</ScaffoldEthAppWithProviders>
          </ThemeProvider>
        </MiniKitContextProvider>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;
