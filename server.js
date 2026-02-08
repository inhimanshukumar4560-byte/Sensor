// Step 1: Zaroori Tools (Libraries) ko bulana
const express = require('express');
const Razorpay = require('razorpay');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config(); // Environment variables ke liye

// Step 2: Express app banana aur Port set karna
const app = express();
const PORT = process.env.PORT || 3000; // Render apne aap port de dega

// Step 3: Server ke liye niyam (middleware) set karna
app.use(cors()); // Doosre server se request accept karne ke liye
app.use(bodyParser.json()); // Frontend se bheje gaye JSON data ko samajhne ke liye
app.use(express.static(path.join(__dirname, 'public'))); // 'public' folder ko sabke liye available karana

// Step 4: Razorpay ko apni Secret Keys ke saath connect karna
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,         // Yeh Render me set hoga, code me nahi likhna hai
    key_secret: process.env.RAZORPAY_KEY_SECRET // Yeh bhi Render me set hoga
});

// Step 5: Payment Order banane ke liye API banana
// Jab frontend se /create-order par request aayegi, to yeh code chalega
app.post('/create-order', async (req, res) => {
    // Frontend se bheja hua amount (rupees me) nikalna
    const { amount } = req.body;

    // Razorpay ke liye payment options taiyar karna
    const options = {
        amount: amount * 100, // Razorpay hamesha 'paise' me amount leta hai. (Isliye 100 se multiply kiya)
        currency: "INR",
        receipt: "order_rcptid_" + Date.now() // Ek unique receipt ID
    };

    // try-catch block: Agar koi error aaye to app crash na ho
    try {
        // Razorpay ke server se order create karwana
        const order = await razorpay.orders.create(options);
        // Naya order (order_id ke saath) frontend ko wapas bhejna
        res.json(order);
    } catch (error) {
        console.error("Razorpay order banane me error:", error);
        res.status(500).send("Server me koi gadbad hai.");
    }
});

// Step 6: App ka main page (Home Route) set karna
// Jab koi user aapki website kholega (e.g., batkaro.onrender.com), to use index.html file dikhegi
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Step 7: Server ko start karna
// Yeh line server ko chalu karti hai taki woh user ki requests sun sake
app.listen(PORT, () => {
    console.log(`Server port ${PORT} par chalu ho gaya hai.`);
});
