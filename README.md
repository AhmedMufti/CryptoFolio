# CryptoPolio - Cryptocurrency Portfolio Management Application

## 📋 Project Overview

**CryptoPolio** is a full-stack web application for managing cryptocurrency portfolios. Users can track real-time crypto prices, buy and sell virtual cryptocurrencies, manage their portfolio, and monitor their investment performance.

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React.js** | UI framework for building the SPA |
| **React Router DOM** | Client-side routing and navigation |
| **Axios** | HTTP client for API requests |
| **Tailwind CSS** | Utility-first CSS framework for styling |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime environment |
| **Express.js** | Web application framework |
| **MongoDB** | NoSQL database for data storage |
| **Mongoose** | MongoDB object modeling |
| **JWT (jsonwebtoken)** | Authentication tokens |
| **bcryptjs** | Password hashing |

### External APIs
| API | Purpose |
|-----|---------|
| **CoinGecko API** | Real-time cryptocurrency prices and market data |
| **Cloudinary API** | Profile image upload and hosting |

---

## 🏗️ Project Architecture

```
cryptopolio/
├── client/                      # React Frontend
│   ├── src/
│   │   ├── Components/
│   │   │   ├── CoinDetails/     # Coin information & charts
│   │   │   ├── Transactions/    # Buy/Sell pages
│   │   │   ├── UserInformation/ # Dashboard, Profile, Assets
│   │   │   ├── Nav.jsx          # Navigation bar
│   │   │   ├── Market.jsx       # Crypto market listing
│   │   │   └── Footer.jsx       # Footer component
│   │   └── App.js               # Main app with routes
│   └── package.json
│
├── server/                      # Node.js Backend
│   ├── Controllers/             # Business logic
│   │   ├── UserTransactions.js  # Buy transaction handling
│   │   ├── UserSellTransactions.js # Sell transaction handling
│   │   └── AssetController.js   # Asset management logic
│   ├── Routes/                  # API endpoints
│   │   ├── Auth.js              # Authentication routes
│   │   ├── Transactions.js      # Transaction routes
│   │   ├── Wallet.js            # Wallet routes
│   │   ├── Assets.js            # Asset management routes
│   │   ├── Userdetails.js       # User profile routes
│   │   └── ProfileUpdate.js     # Profile update routes
│   ├── models/                  # MongoDB schemas
│   │   ├── User.js              # User model
│   │   ├── Wallet.js            # Wallet model
│   │   ├── Asset.js             # Asset holdings model
│   │   └── Profile.js           # Profile picture model
│   └── index.js                 # Server entry point
│
└── start-app.bat               # Windows startup script
```

---

## ✅ Implemented Features

### 1. User Authentication
- **Sign Up**: New user registration with email, password, name, mobile
- **Sign In**: Login with email and password
- **Sign Out**: Logout functionality  
- **JWT Authentication**: Secure token-based authentication

### 2. User Profile Management
- **View Profile**: Display user information on dashboard
- **Update Profile Picture**: Upload images via Cloudinary integration
- **Edit Profile Details**: Update first name, last name, and mobile number
- **Success Notifications**: Visual feedback on successful updates

### 3. Cryptocurrency Market
- **Live Market Data**: Real-time prices from CoinGecko API (100 cryptocurrencies)
- **Search Functionality**: Search cryptocurrencies by name
- **Currency Toggle**: Switch between INR and USD display
- **Responsive Cards**: Visual crypto cards with price, high/low info

### 4. Coin Details Page
- **Price Information**: Current price, 24h high, 24h low, price change
- **Currency Toggle**: Switch between INR and USD
- **Buy/Sell Buttons**: Quick access to trading
- **Back Navigation**: Return to market page

### 5. Buy Cryptocurrency
- **Buy by Quantity**: Enter quantity to purchase
- **Buy by Amount**: Enter amount to spend (supports INR/USD toggle)
- **Balance Display**: Shows current wallet balance
- **Holdings Display**: Shows how much of the coin user already owns
- **Max Buy Calculation**: Shows maximum purchasable quantity
- **Insufficient Balance Alert**: Prevents overspending
- **Success Modal**: Animated success message with auto-redirect
- **Currency Toggle**: All values update when switching INR/USD

### 6. Sell Cryptocurrency
- **Sell by Quantity**: Enter quantity to sell
- **Sell to Get Amount**: Enter desired amount (supports INR/USD toggle)
- **Holdings Display**: Shows current holdings of the coin
- **Sell All Button**: Quick sell entire holding
- **Insufficient Holdings Alert**: Prevents overselling
- **Disabled State**: Prevents selling if no holdings
- **Success Modal**: Animated success message with auto-redirect
- **Currency Toggle**: All values update when switching INR/USD

### 7. Wallet Management
- **Wallet Balance**: Display current available balance
- **Invested Amount**: Track total amount invested
- **Transaction History**: View all buy/sell transactions
- **Currency Toggle**: Display in INR or USD

### 8. Asset Management (Portfolio)
- **Portfolio Overview**: Total portfolio value, wallet balance, assets owned
- **Asset List**: All cryptocurrencies owned with details:
  - Coin name and image
  - Quantity held
  - Average buy price
  - Total invested
  - Percentage of portfolio (with progress bar)
- **Quick Actions**: Buy/Sell buttons for each asset (navigates to specific coin)
- **Net Worth**: Total portfolio + available cash
- **Currency Toggle**: Respects dashboard currency setting

### 9. Transaction Integration
- **Buy Flow**: When user buys crypto:
  1. Deducts amount from wallet
  2. Records transaction in history
  3. Creates/updates Asset record (quantity, average price, total invested)
- **Sell Flow**: When user sells crypto:
  1. Adds amount to wallet
  2. Records transaction in history
  3. Updates/removes Asset record

### 10. Dashboard
- **User Profile Section**: Photo, name, email, mobile with edit button
- **Wallet Section**: Balance and invested amounts
- **Portfolio Section**: Asset management component
- **Transactions Section**: Scrollable transaction history
- **Currency Toggle**: Global INR/USD toggle for all values
- **Auto-Refresh**: Data refreshes on every navigation

### 11. Navigation & UX
- **Back Buttons**: Present on all pages for easy navigation
- **Responsive Design**: Works on mobile and desktop
- **Loading States**: Visual feedback while data loads
- **Error Handling**: User-friendly error messages
- **Success Messages**: Confirmation on successful actions

---

## 📁 Database Models

### User Model
```javascript
{
  first_name: String,
  last_name: String,
  age: Number,
  mob: Number,
  email: String,
  password: String (hashed)
}
```

### Wallet Model
```javascript
{
  UserId: String,
  Amount: Number,        // Current balance
  Invested: Number,      // Total invested
  Transactions: Array    // Transaction history
}
```

### Asset Model
```javascript
{
  UserId: String,
  CoinId: String,
  CoinName: String,
  Symbol: String,
  Image: String,
  Quantity: Number,
  AverageBuyPrice: Number,
  TotalInvested: Number,
  CreatedAt: Date,
  UpdatedAt: Date
}
```

### Profile Model
```javascript
{
  userId: String,
  url: String  // Cloudinary image URL
}
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/createuser` | Register new user |
| POST | `/auth/login` | User login |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/dashboard/dashboard` | Get user ID from token |
| POST | `/dashboard/userdetails` | Get user profile data |
| POST | `/dashboard/updateuserdetails` | Update user name/mobile |
| POST | `/dashboard/profileupdate` | Update profile picture |

### Wallet
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/wallet/getwalletAmount` | Get balance & invested |
| POST | `/wallet/getwalletTransaction` | Get transaction history |
| POST | `/wallet/wallet` | Create/update wallet |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/transactions/transactions` | Buy cryptocurrency |
| POST | `/transactions/selltransactions` | Sell cryptocurrency |

### Assets
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/assets/getAssets` | Get all user assets |
| POST | `/assets/addAsset` | Add new asset |
| POST | `/assets/removeAsset` | Remove/reduce asset |
| POST | `/assets/summary` | Get portfolio summary |

---

## 🚀 Running the Application

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Environment Variables
Create `.env` file in `/server`:
```
MONGO_URL=mongodb://localhost:27017/crypto
PORT=3001
JWT_SECRET=your_jwt_secret
```

### Quick Start (Windows)
```bash
# Run the startup script
.\start-app.bat
```

### Manual Start
```bash
# Terminal 1 - Start Backend
cd server
npm install
npm start

# Terminal 2 - Start Frontend
cd client
npm install
npm start
```

### Access
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

---

## 🎨 UI/UX Features

- **Dark Theme**: Professional dark color scheme (#171b26, #1d2230, #272e41)
- **Accent Colors**: 
  - Primary Blue: #209fe4
  - Success Green: #26a69a
  - Danger Red: #c12f3d
  - Warning Orange: #f59e0b
- **Responsive Design**: Mobile-friendly layouts
- **Hover Effects**: Interactive buttons with transitions
- **Loading States**: Animated loading indicators
- **Success Modals**: Animated success confirmations
- **Progress Bars**: Visual portfolio percentage indicators

---

## 📈 Future Enhancements (Not Yet Implemented)

- [ ] Real-time price updates via WebSockets
- [ ] Price alerts and notifications
- [ ] Portfolio performance charts and analytics
- [ ] Multiple fiat currency support
- [ ] Two-factor authentication
- [ ] Dark/Light theme toggle
- [ ] Export transaction history (CSV/PDF)
- [ ] Watchlist feature
- [ ] Social sharing

---

## 👥 Credits

**Developed for**: Client Portfolio Management Solution  
**Last Updated**: January 2026  
**Version**: 1.0.0

---

## 📄 License

This project is proprietary software developed for a specific client engagement.
