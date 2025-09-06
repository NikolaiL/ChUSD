# # Pika chUSD
[Website]()
[GitHub]()
[Submission]()
[Slide deck]()

![Pikachu](images/excited.png)

Pika chUSD is a Base miniapp game that uses ETH as collateral to mint chUSD stablecoin. The collateral ratio of ETH determines Pikachu's mood, which changes based on the health factor of the collateral ratio of ETH/chUSD. As a user, you are responsible for keeping Pikachu happy; if the collateral ratio drops, it will negatively affect Pikachu's mood and expose you to liquidation risk.


How it works:

- After depositing ETH, the user will receive chUSD and the game will display the default state of Pikachu's mood

- Pikatchu's mood changes based on the price of ETH as collateral 

- As user you are responsible for keeping Pikachu in a happy mood and avoiding liquidation of your collateral 

- The game itself has five stages of Pikachu's happiness based on the liquidation risk of your collateral


## Bounties 
RedStone 
We are using RedStone stack for BaseETH price feed changes between BaseETH and chUSD to reflect changes of the Pikachu character
Base 
We are using BaseETH as collateral for the game and deployed the game as Base miniapp 
BuidlGuidl
We are using ScaffoldETH stack as front end and back end of the game itself 

## Next steps
We are planning to enable user to earn yield on chUSD stablecoin as well enable notifications when the price changes to avoid user to get REKT (liquidated)