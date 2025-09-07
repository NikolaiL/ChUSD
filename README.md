# Pika chUSD ⚡

<div align="center">

![Pikachu](images/excited.png)

**A gamified stablecoin Base miniapp that uses ETH as collateral to mint chUSD stablecoin**

[![Website](https://img.shields.io/badge/Website-Live-brightgreen)](https://your-website.com)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black)](https://github.com/the-stable-corp/ChUSD)
[![Submission](https://img.shields.io/badge/Submission-ETH%20Warsaw%202025-blue)](https://taikai.network/ethwarsaw/hackathons/ethwarsaw-2025/projects/cmf8qfbpe01bugq91jvys8ocn/idea)
[![Slide Deck](https://img.shields.io/badge/Slide%20Deck-Presentation-red)](https://www.canva.com/design/DAGx6vsXRns/XYWuIsS5EQV_2Fge8OvbIA/edit?utm_content=DAGx6vsXRns&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton)

</div>

---

## 🎮 Overview

Pika chUSD is a revolutionary gamified stablecoin experience built as a Base miniapp. Users deposit ETH as collateral to mint chUSD stablecoin, with Pikachu's mood serving as a real-time indicator of their collateral health. The more stable your position, the happier Pikachu becomes!

### ✨ Key Features

- 🎯 **Gamified Experience**: Pikachu's mood reflects your collateral health
- 💰 **ETH Collateral**: Use ETH to mint chUSD stablecoin
- 🎨 **5 Mood States**: Visual feedback based on liquidation risk
- ⚡ **Real-time Updates**: Dynamic mood changes with price fluctuations
- 🛡️ **Liquidation Protection**: Visual warnings to prevent liquidation

---

## 🎢 How It Works

1. **📥 Deposit ETH**: Users deposit ETH as collateral to receive chUSD
2. **🐥 Mood Monitoring**: Pikachu's mood changes based on ETH price and collateral ratio
3. **🧑‍💻 User Responsibility**: Keep Pikachu happy to avoid liquidation
4. **🕹️ 5 Happiness Stages**: Different moods based on liquidation risk levels

### Pikachu's Mood States

| Mood | Collateral Ratio | Risk Level | Action Required |
|------|------------------|------------|-----------------|
| 😄 Excited | > 200% | Very Low | None - Keep it up! |
| 😊 Happy | 150-200% | Low | Monitor |
| 😐 Neutral | 120-150% | Medium | Consider adding collateral |
| 😟 Anxious | 110-120% | High | Add collateral soon |
| 😢 Sad | < 110% | Critical | Immediate action needed |

---

## 🛠️ Tech Stack

### Frontend & Backend
- **🏆 ScaffoldETH**: Complete dApp framework
- **⚡ Next.js**: React framework for the frontend
- **🎨 RainbowKit**: Wallet connection and UI components
- **🔗 Wagmi**: React hooks for Ethereum

### Smart Contracts
- **🔨 Foundry**: Solidity development framework
- **📊 RedStone**: Price feed oracles for ETH/USD data
- **🏗️ OpenZeppelin**: Secure contract libraries

### Blockchain
- **🟦 Base**: Layer 2 for low-cost transactions
- **⚡ ETH**: Native collateral asset

---

## 🏆 Bounties & Integrations

### 🛑 RedStone Integration
- **Purpose**: Real-time ETH price feeds
- **Implementation**: BaseETH price changes reflected in Pikachu's mood
- **Benefit**: Accurate collateral ratio monitoring

### 🟦 Base Miniapp
- **Purpose**: Native Base ecosystem integration
- **Implementation**: Deployed as Base miniapp for seamless UX
- **Benefit**: Low gas fees and fast transactions

### 🏗️ BuidlGuidl ScaffoldETH
- **Purpose**: Complete development stack
- **Implementation**: Frontend and backend infrastructure
- **Benefit**: Rapid development and deployment

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Yarn package manager
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/the-stable-corp/ChUSD.git
cd ChUSD

# Install dependencies
yarn install

# Start local blockchain
yarn chain

# Deploy contracts
yarn deploy

# Start the frontend
yarn start
```

### Development Workflow

1. **Start Local Environment**:
   ```bash
   yarn chain    # Start local blockchain
   yarn deploy   # Deploy contracts
   yarn start    # Start frontend
   ```

2. **Interact with Contracts**:
   - Visit `http://localhost:3000/debug` for contract interaction
   - Use the provided UI components for testing

3. **Deploy to Base**:
   ```bash
   yarn deploy --network base-sepolia
   ```

---

## 🔮 Roadmap

### Phase 1: Core Features ✅
- [x] ETH collateral system
- [x] chUSD minting mechanism
- [x] Pikachu mood system
- [x] Base miniapp deployment

### Phase 2: Enhanced UX 🚧
- [ ] **Yield Generation**: Earn yield on chUSD stablecoin
- [ ] **Push Notifications**: Price change alerts to prevent liquidation
- [ ] **Mobile Optimization**: Enhanced mobile experience
- [ ] **Advanced Analytics**: Detailed position tracking

### Phase 3: Community Features 📈
- [ ] **Leaderboards**: Top Pikachu caretakers
- [ ] **Achievements**: Gamification rewards
- [ ] **Social Features**: Share your Pikachu's mood
- [ ] **Multi-asset Support**: Additional collateral types

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

## 📄 License

This project is licensed under the **GNU General Public License v3.0 (GPL-3.0)** - see the [LICENSE](LICENSE) file for details.

### ⚠️ Important Notice

This software is **GPL-3.0 licensed**. This means:
- ✅ You can use, modify, and distribute this software
- ✅ You can create derivative works
- ❌ **Any derivative works MUST also be GPL-3.0 licensed**
- ❌ **You CANNOT use this code in proprietary/closed-source projects**
- ❌ **You CANNOT change the license to MIT, Apache, or any other license**

**If you use this code, your project must remain open source and GPL-3.0 licensed.**

---

## 👥 Team

<div align="center">

### Core Team

<table>
  <tr>
    <td align="center">
      <a href="https://x.com/0xjsieth">
        <img src="https://pbs.twimg.com/profile_images/1888550284021923840/P5f5jXpr_400x400.png" width="100px;" alt="0xjsieth"/>
        <br />
        <sub><b>@0xjsieth</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://x.com/AnettRolikova">
        <img src="https://pbs.twimg.com/profile_images/1239269511561457665/qWkxcDFd_400x400.jpg" width="100px;" alt="AnettRolikova"/>
        <br />
        <sub><b>@AnettRolikova</b></sub>
      </a>
    </td>
  </tr>
</table>

</div>

---

## 🙏 Acknowledgments

- **ScaffoldETH Team**: For the amazing development framework
- **Base Team**: For the Layer 2 infrastructure
- **RedStone**: For reliable price feeds
- **ETH Warsaw 2025**: For the hackathon opportunity

---

<div align="center">

**Keep Pikachu Happy! ⚡**

[Website](https://your-website.com) • [GitHub](https://github.com/the-stable-corp/ChUSD) • [Demo](https://your-demo.com)

</div>