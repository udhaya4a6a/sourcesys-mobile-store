# SourceSys Mobiles - E-commerce Platform

A full-stack e-commerce mobile store with user authentication, payment integration, and PDF invoice generation.

## 🌐 Live Demo

🔗 **Website:**  
https://udhaya4a6a.github.io/sourcesys-mobile-store/
🔗 **GitHub Repository:**  
https://github.com/udhaya4a6a/sourcesys-mobile-store.git

---

## Features

- ✅ User Registration & Login with database storage
- ✅ Shopping Cart functionality
- ✅ Razorpay Payment Integration
- ✅ PDF Invoice/Receipt Download
- ✅ Order Management
- ✅ Responsive Design
- 🛍️ Modern product listing with animated cards
- 🔍 Real-time smart search (filters products as you type)
- 👀 Product Details modal
- 🎨 Smooth animations & micro-interactions

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: SQLite
- **Payment Gateway**: Razorpay
- **PDF Generation**: jsPDF

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Razorpay

1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Get your API keys from Settings → API Keys
3. Create a `.env` file in the root directory:

```env
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_secret_key_here
PORT=3000
```

**Important Security Notes**:
- The server will **not start** if Razorpay credentials are missing
- Razorpay Key ID is automatically served to the frontend via API (no hardcoded keys)
- Never commit your `.env` file to version control
- For testing, use Razorpay's test mode keys
- For production, use live mode keys from your Razorpay dashboard

### 3. Start the Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

The server will run on `http://localhost:3000`

### 4. Open the Application

Open `index.html` in your browser or navigate to `http://localhost:3000`

## Project Structure

```
sourcesys_Demo/
├── server.js              # Backend server with API endpoints
├── package.json           # Node.js dependencies
├── database.db            # SQLite database (auto-created)
├── index.html             # Home page
├── login.html             # Login page
├── signup.html            # Registration page
├── cart.html              # Shopping cart
├── checkout.html          # Payment checkout
├── success.html           # Order success page
├── script.js              # Frontend JavaScript
├── invoice.js             # PDF invoice generation
└── style.css              # Stylesheet
```

## API Endpoints

### Authentication
- `POST /api/signup` - User registration
- `POST /api/login` - User login

### Payments
- `POST /api/create-order` - Create Razorpay order
- `POST /api/verify-payment` - Verify payment and save order
- `GET /api/razorpay-key` - Get Razorpay key ID (for frontend)

### Orders
- `GET /api/orders/:userId` - Get user orders

## Database Schema

### Users Table
- `id` (INTEGER PRIMARY KEY)
- `name` (TEXT)
- `email` (TEXT UNIQUE)
- `phone` (TEXT)
- `password` (TEXT - hashed)
- `created_at` (DATETIME)

### Orders Table
- `id` (INTEGER PRIMARY KEY)
- `user_id` (INTEGER)
- `order_id` (TEXT UNIQUE)
- `items` (TEXT - JSON)
- `total_amount` (REAL)
- `payment_id` (TEXT)
- `payment_status` (TEXT)
- `created_at` (DATETIME)

## Usage Flow

1. **Sign Up**: Create a new account
2. **Login**: Sign in to your account
3. **Browse Products**: View available mobile phones
4. **Add to Cart**: Add products to shopping cart
5. **Checkout**: Proceed to payment
6. **Pay**: Complete payment via Razorpay
7. **Download Invoice**: Get PDF receipt after successful payment

## Important Notes

- **Server must be running**: The server must be running before using login/signup
- **Environment Variables Required**: The server will exit if Razorpay credentials are not set in `.env`
- **Security**: User authentication is validated on the server for all payment operations
- **Database**: The database file (`database.db`) is created automatically on first run
- **Error Handling**: All endpoints now have proper error handling and validation

## 📱 Responsive Design

The website is optimized for:
- 📱 Mobile phones
- 💻 Tablets
- 🖥️ Desktop screens

Responsiveness is achieved using **CSS Grid, Flexbox, and media queries**.

## Troubleshooting

### Server Connection Error
- Ensure the server is running on port 3000
- Check if port 3000 is already in use
- Verify `API_URL` in login.html and signup.html matches your server URL

### Payment Issues
- Verify Razorpay keys are correct
- Check Razorpay dashboard for payment logs
- Ensure you're using test mode keys for development

### Database Issues
- Delete `database.db` to reset the database
- Check file permissions in the project directory

## License

ISC

