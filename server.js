require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');


const Vendor = require('./models/vendor');
const Offer = require('./models/offer');
const Customer = require('./models/customer');
const Invoice = require('./models/invoice');
const Location = require('./models/location.js');

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend (optional)
app.use('/', express.static(path.join(__dirname, 'gomint')));

// Serve uploads
app.use('/uploads', express.static('uploads'));

// Mount API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/customers', require('./routes/customer'));
app.use('/api/vendors', require('./routes/vendor'));
app.use('/api/offers', require('./routes/offer'));
app.use('/api/invoices', require('./routes/invoice'));
app.use('/api/locations', require('./routes/location'));
app.use('/api/cashback-requests', require('./routes/cashbackRequest')); // THREE LANE: Cashback request flow

// AI Chat endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, context } = req.body;

    // Simple AI response logic (in production, use OpenAI, Claude, etc.)
    const response = generateAIResponse(message, context);

    res.json({
      response,
      timestamp: new Date(),
      confidence: 0.85
    });
  } catch (error) {
    console.error('AI Chat error:', error);
    res.status(500).json({ error: 'AI service temporarily unavailable' });
  }
});

// AI Insights endpoint
app.get('/api/ai/insights/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { type } = req.query; // business, customer, operator

    const insights = await generateAIInsights(userId, type);

    res.json({
      insights,
      generatedAt: new Date(),
      model: 'GoMint-AI-v1'
    });
  } catch (error) {
    console.error('AI Insights error:', error);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

// AI Recommendations endpoint
app.get('/api/ai/recommendations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const recommendations = await generateRecommendations(userId);

    res.json({
      recommendations,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('AI Recommendations error:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.warn('⚠️  MONGO_URI not set in .env - using in-memory mode');
      // Continue without MongoDB
    } else {
      // Try to connect but don't block if it fails
      mongoose.connect(uri, { serverSelectionTimeoutMS: 3000, socketTimeoutMS: 3000 })
        .then(() => console.log('✓ Connected to MongoDB'))
        .catch(err => console.warn('⚠️  MongoDB unavailable:', err.message));
    }

    // Continue with server startup immediately - don't wait for MongoDB

    // Optional: seed initial data
    if (process.env.SEED === 'true' && uri) {
      console.log('SEED=true — seeding initial data (will attempt after DB connects)');

      // Drop old indexes

      await mongoose.connection.db.collection('vendors').dropIndexes().catch(err => console.log('Drop indexes error:', err.message));

      // Clear collections
      await Vendor.deleteMany({});
      await Offer.deleteMany({});
      await Customer.deleteMany({});
      await Invoice.deleteMany({});
      await Location.deleteMany({});

      // Create vendor
      const vendor = await Vendor.create({
        businessName: 'Demo Business',
        currency: 'USD',
        address: 'Happy Street, New Town, CA',
        country: 'USA'
      });

      // Create location (needed for Offer)
      const location = await Location.create({
        vendorId: vendor._id,
        name: 'Bayside',
        address: 'Happy Street',
        city: 'New Town',
        state: 'CA',
        country: 'USA',
        postalCode: '00000',
        phone: '9999999999'
      });

      // Create offer
      const offer = await Offer.create({
        name: 'Cashback Offer 10%',
        brand: 'DemoBrand',
        category: 'Shopping',
        startDate: new Date(),
        endDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // +7 days
        minAmount: 10,
        maxAmount: 100,
        cashbackPercent: 10,
        businessId: vendor._id,
        locationId: location._id
      });

      // Create customer
      const customer = await Customer.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        mobile: '9999999999',
        country: 'United States'
      });

      // Create invoice
      const invoice = await Invoice.create({
        invoiceNumber: 'INV-1',
        vendorId: vendor._id,
        operatorName: 'Operator',
        operatorEmail: 'op@example.com',
        invoiceDate: new Date(),
        totalAmount: 180
      });

      console.log('Seeded:', {
        vendor: vendor._id.toString(),
        location: location._id.toString(),
        offer: offer._id.toString(),
        customer: customer._id.toString(),
        invoice: invoice._id.toString()
      });
    }

    // AI Response Functions
    function generateAIResponse(message, context = {}) {
      const responses = {
        greeting: [
          "Hello! I'm your GoMint AI assistant. How can I help you today?",
          "Hi there! Welcome to GoMint. What can I assist you with?",
          "Greetings! I'm here to help you with your GoMint experience."
        ],
        invoice: [
          "I can help you with invoice management. You can view, create, and track invoices.",
          "For invoices, you can check payment status, download PDFs, or create new ones.",
          "Invoice assistance: I can guide you through viewing details, payment tracking, or creating new invoices."
        ],
        payment: [
          "Payment processing is secure and fast. Check your invoice status for updates.",
          "We support multiple payment methods. Your transactions are protected.",
          "Payment questions? I can help you understand your invoice status and payment options."
        ],
        business: [
          "Business management includes customer tracking, offer creation, and cashback rewards.",
          "As a business owner, you can manage locations, create offers, and track customer interactions.",
          "Business features: Customer management, location setup, offer creation, and reward systems."
        ],
        customer: [
          "Customer features include profile management, cashback tracking, and invoice viewing.",
          "You can update your bank details, view your cashback rewards, and manage your profile.",
          "Customer dashboard: Track your rewards, update information, and view transaction history."
        ],
        support: [
          "I'm here to help! You can ask about invoices, payments, business management, or customer features.",
          "Support topics: Account setup, invoice issues, payment problems, feature questions.",
          "How can I assist you? Feel free to ask about any GoMint functionality."
        ],
        default: [
          "I'm not sure about that specific question. Try asking about invoices, payments, business management, or customer features.",
          "I specialize in GoMint platform assistance. What specific area can I help you with?",
          "Let me help you with GoMint features. Ask about invoices, payments, or account management."
        ]
      };

      const lowerMessage = message.toLowerCase();

      if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        return responses.greeting[Math.floor(Math.random() * responses.greeting.length)];
      }
      if (lowerMessage.includes('invoice') || lowerMessage.includes('bill')) {
        return responses.invoice[Math.floor(Math.random() * responses.invoice.length)];
      }
      if (lowerMessage.includes('pay') || lowerMessage.includes('payment')) {
        return responses.payment[Math.floor(Math.random() * responses.payment.length)];
      }
      if (lowerMessage.includes('business') || lowerMessage.includes('vendor')) {
        return responses.business[Math.floor(Math.random() * responses.business.length)];
      }
      if (lowerMessage.includes('customer') || lowerMessage.includes('profile')) {
        return responses.customer[Math.floor(Math.random() * responses.customer.length)];
      }
      if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
        return responses.support[Math.floor(Math.random() * responses.support.length)];
      }

      return responses.default[Math.floor(Math.random() * responses.default.length)];
    }

    function generateBusinessInsights(businessData = {}) {
      const insights = [
        {
          title: "Revenue Growth",
          description: "Your revenue has increased by 15% this month compared to last month.",
          type: "positive",
          icon: "fas fa-chart-line"
        },
        {
          title: "Customer Acquisition",
          description: "You've gained 25 new customers this week. Keep up the great work!",
          type: "positive",
          icon: "fas fa-users"
        },
        {
          title: "Cashback Performance",
          description: "Your cashback rewards program has redeemed 40% more this month.",
          type: "positive",
          icon: "fas fa-gift"
        },
        {
          title: "Invoice Processing",
          description: "Average invoice processing time has improved by 20%.",
          type: "neutral",
          icon: "fas fa-clock"
        },
        {
          title: "Payment Optimization",
          description: "Consider setting up automatic payment reminders to reduce overdue invoices.",
          type: "suggestion",
          icon: "fas fa-lightbulb"
        }
      ];

      // Return random insights (in real implementation, this would be based on actual data)
      return insights.sort(() => 0.5 - Math.random()).slice(0, 3);
    }

    function generateRecommendations(userType = 'customer', context = {}) {
      const customerRecommendations = [
        {
          title: "Update Bank Details",
          description: "Keep your payment information current for faster transactions.",
          action: "Update Now",
          icon: "fas fa-credit-card"
        },
        {
          title: "Check Cashback Rewards",
          description: "You have pending cashback rewards waiting to be claimed.",
          action: "View Rewards",
          icon: "fas fa-gift"
        },
        {
          title: "Review Recent Invoices",
          description: "Check your latest invoices and payment status.",
          action: "View Invoices",
          icon: "fas fa-file-invoice"
        }
      ];

      const businessRecommendations = [
        {
          title: "Create New Offer",
          description: "Attract more customers with a special promotion.",
          action: "Create Offer",
          icon: "fas fa-plus-circle"
        },
        {
          title: "Review Customer Feedback",
          description: "Check recent customer interactions and feedback.",
          action: "View Feedback",
          icon: "fas fa-comments"
        },
        {
          title: "Update Business Profile",
          description: "Ensure your business information is current and complete.",
          action: "Update Profile",
          icon: "fas fa-edit"
        }
      ];

      if (userType === 'business' || userType === 'vendor') {
        return businessRecommendations;
      }
      return customerRecommendations;
    }

    // AI Endpoints
    app.post('/api/ai/chat', async (req, res) => {
      try {
        const { message, context } = req.body;
        if (!message) {
          return res.status(400).json({ error: 'Message is required' });
        }

        const response = generateAIResponse(message, context || {});
        res.json({
          response,
          timestamp: new Date().toISOString(),
          context: context || {}
        });
      } catch (error) {
        console.error('AI Chat Error:', error);
        res.status(500).json({ error: 'Failed to process AI chat request' });
      }
    });

    app.get('/api/ai/insights', async (req, res) => {
      try {
        const { userType, userId } = req.query;
        const insights = generateBusinessInsights({ userType, userId });
        res.json({
          insights,
          generatedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('AI Insights Error:', error);
        res.status(500).json({ error: 'Failed to generate insights' });
      }
    });

    app.get('/api/ai/recommendations', async (req, res) => {
      try {
        const { userType, userId } = req.query;
        const recommendations = generateRecommendations(userType || 'customer', { userId });
        res.json({
          recommendations,
          generatedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('AI Recommendations Error:', error);
        res.status(500).json({ error: 'Failed to generate recommendations' });
      }
    });

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Database connection or seeding failed:', err.message);
    console.log('Starting server without database...');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  }
}

start();