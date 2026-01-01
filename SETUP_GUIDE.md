# Quick Setup Guide

## Step 1: Install Node.js

1. Download Node.js from: https://nodejs.org/
2. Install the LTS (Long Term Support) version
3. Restart your terminal/command prompt after installation
4. Verify installation by running:
   ```bash
   node --version
   npm --version
   ```

## Step 2: Install Dependencies

Once Node.js is installed, run:
```bash
npm install
```

## Step 3: Configure Razorpay

1. Create a `.env` file in the project root directory
2. Add your Razorpay keys:

```env
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_secret_key_here
PORT=3000
```

**To get Razorpay keys:**
- Sign up at https://dashboard.razorpay.com/
- Go to Settings → API Keys
- Copy your Key ID and Secret Key
- For testing, use Test Mode keys

## Step 4: Start the Server

```bash
npm start
```

You should see: `Server running on http://localhost:3000`

## Step 5: Open the Application

- Open `index.html` in your browser
- Or navigate to `http://localhost:3000`

## Troubleshooting

### "Connection error" when signing up
- Make sure the server is running (Step 4)
- Check that the server shows "Server running on http://localhost:3000"
- Verify `.env` file exists with Razorpay keys

### "npm is not recognized"
- Node.js is not installed or not in PATH
- Install Node.js from nodejs.org
- Restart your terminal after installation

### Server won't start
- Check if port 3000 is already in use
- Verify `.env` file has valid Razorpay keys
- Make sure all dependencies are installed (`npm install`)

