│
└───src
    ├───app
    │   │   favicon.ico
    │   │   globals.css
    │   │   layout.tsx
    │   │   page.tsx
    │   │   providers.tsx
    │   │
    │   ├───api
    │   │   ├───alerts
    │   │   │       route.ts
    │   │   │
    │   │   ├───auth
    │   │   │   └───[...nextauth]
    │   │   │           route.ts
    │   │   │
    │   │   ├───news
    │   │   │       route.ts
    │   │   │
    │   │   ├───push
    │   │   │   ├───send
    │   │   │   │       route.ts
    │   │   │   │
    │   │   │   └───subscribe
    │   │   │           route.ts
    │   │   │
    │   │   ├───stocktwits
    │   │   │       route.ts
    │   │   │
    │   │   └───watchlists
    │   │           route.ts
    │   │
    │   └───stocks
    │       └───[symbol]
    │               page.tsx
    │
    ├───components
    │       AlertForm.tsx
    │       AlertsList.tsx
    │       AuthButton.tsx
    │       Chart.tsx
    │       NavBar.tsx
    │       NewsFeed.tsx
    │       PushManager.tsx
    │       SearchBar.tsx
    │       Skeleton.tsx
    │       SocialBuzz.tsx
    │       StockCard.tsx
    │       StockDashboard.tsx
    │       TrendingStocks.tsx
    │       WatchlistForm.tsx
    │       WatchlistList.tsx
    │
    └───hooks
            useWebSocket.ts