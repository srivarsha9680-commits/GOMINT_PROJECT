const mongoose = require('mongoose');

const cashbackRequestSchema = new mongoose.Schema({
    // Customer info
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    customerMobile: {
        type: String,
        trim: true
    },
    customerEmail: {
        type: String,
        lowercase: true,
        trim: true
    },

    // Business/Vendor info
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    businessName: {
        type: String,
        trim: true
    },

    // Offer/Location info
    offerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Offer',
        sparse: true
    },
    locationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
        sparse: true
    },
    locationName: {
        type: String,
        trim: true
    },

    // Request details
    requestNumber: {
        type: String,
        unique: true,
        trim: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    cashbackPercent: {
        type: Number,
        min: 0,
        max: 100
    },
    purchaseDetails: {
        type: String,
        trim: true
    },

    // Bank details snapshot (for audit trail)
    bankDetails: {
        acctHolder: String,
        bankName: String,
        acctNumber: String,
        ifsc: String,
        state: String,
        country: String
    },

    // Status tracking - THREE LANE CHECKPOINT
    requestStatus: {
        type: String,
        enum: ['pending', 'in-process', 'approved', 'paid', 'rejected', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },

    // Invoice reference (created by operator)
    invoiceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invoice',
        sparse: true
    },

    // Metadata
    submittedAt: {
        type: Date,
        default: Date.now
    },
    approvedAt: {
        type: Date,
        sparse: true
    },
    paidAt: {
        type: Date,
        sparse: true
    },
    approvedBy: {
        type: String, // operator name or ID
        trim: true
    },
    rejectionReason: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        trim: true
    },

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
cashbackRequestSchema.index({ customerId: 1, createdAt: -1 });
cashbackRequestSchema.index({ businessId: 1, createdAt: -1 });
cashbackRequestSchema.index({ requestStatus: 1 });
cashbackRequestSchema.index({ requestNumber: 1 });

// Middleware to update updatedAt
cashbackRequestSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.models.CashbackRequest || mongoose.model('CashbackRequest', cashbackRequestSchema);
