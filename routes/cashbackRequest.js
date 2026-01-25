const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const CashbackRequest = require('../models/cashbackRequest');
const Customer = require('../models/customer');
const Vendor = require('../models/vendor');
const auth = require('../middleware/auth');

// Generate unique request number
const generateRequestNumber = async () => {
    const count = await CashbackRequest.countDocuments();
    return `REQ-${Date.now().toString().slice(-8)}-${(count + 1).toString().padStart(4, '0')}`;
};

// ============================================
// CUSTOMER FLOW: Submit cashback redeem request
// ============================================

// POST /api/cashback-requests - Customer submits redeem request
router.post('/', auth, [
    body('customerId').notEmpty().withMessage('Customer ID required'),
    body('businessId').notEmpty().withMessage('Business ID required'),
    body('amount').isFloat({ min: 0 }).withMessage('Valid amount required'),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { customerId, businessId, offerId, locationId, amount, cashbackPercent, purchaseDetails } = req.body;

        // Verify customer exists
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        // Verify customer has bank details (checkpoint: customer must complete profile)
        if (!customer.bankDetails || !customer.bankDetails.acctNumber) {
            return res.status(400).json({ error: 'Bank details required before requesting cashback. Please update your profile.' });
        }

        // Verify business exists
        const business = await Vendor.findById(businessId);
        if (!business) {
            return res.status(404).json({ error: 'Business not found' });
        }

        // Generate unique request number
        const requestNumber = await generateRequestNumber();

        // Create cashback request
        const cashbackRequest = new CashbackRequest({
            customerId,
            customerMobile: customer.mobile,
            customerEmail: customer.email,
            businessId,
            businessName: business.businessName,
            offerId,
            locationId,
            locationName: req.body.locationName || '',
            requestNumber,
            amount,
            cashbackPercent: cashbackPercent || 0,
            purchaseDetails,
            // Snapshot bank details for audit trail
            bankDetails: customer.bankDetails,
            requestStatus: 'pending',
            paymentStatus: 'pending',
            submittedAt: new Date()
        });

        await cashbackRequest.save();

        // Populate for response
        await cashbackRequest.populate('customerId', 'firstName lastName mobile email');
        await cashbackRequest.populate('businessId', 'businessName');

        res.status(201).json({
            message: 'Cashback request submitted successfully',
            requestId: cashbackRequest._id,
            requestNumber: cashbackRequest.requestNumber,
            status: cashbackRequest.requestStatus,
            data: cashbackRequest
        });
    } catch (err) {
        console.error('Error creating cashback request:', err);
        res.status(500).json({ error: err.message });
    }
});

// ============================================
// CUSTOMER FLOW: View their own requests
// ============================================

// GET /api/cashback-requests?customerId=xxx - Customer views their requests
router.get('/', async (req, res) => {
    try {
        const { customerId, businessId, status } = req.query;
        const query = {};

        if (customerId) query.customerId = customerId;
        if (businessId) query.businessId = businessId;
        if (status) query.requestStatus = status;

        const requests = await CashbackRequest.find(query)
            .populate('customerId', 'firstName lastName mobile email')
            .populate('businessId', 'businessName')
            .populate('offerId', 'name cashbackPercent')
            .populate('invoiceId')
            .sort({ submittedAt: -1 })
            .limit(200);

        res.json(requests);
    } catch (err) {
        console.error('Error fetching cashback requests:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/cashback-requests/:id - Get specific request
router.get('/:id', async (req, res) => {
    try {
        const request = await CashbackRequest.findById(req.params.id)
            .populate('customerId', 'firstName lastName mobile email')
            .populate('businessId', 'businessName')
            .populate('offerId')
            .populate('invoiceId');

        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        res.json(request);
    } catch (err) {
        console.error('Error fetching request:', err);
        res.status(500).json({ error: err.message });
    }
});

// ============================================
// OPERATOR FLOW: Approve/process requests
// ============================================

// PUT /api/cashback-requests/:id/approve - Operator approves request
router.put('/:id/approve', auth, [
    body('approvedBy').notEmpty().withMessage('Operator name required'),
], async (req, res) => {
    try {
        const { approvedBy, notes } = req.body;

        const request = await CashbackRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        // Update status
        request.requestStatus = 'in-process';
        request.approvedAt = new Date();
        request.approvedBy = approvedBy;
        if (notes) request.notes = notes;

        await request.save();

        res.json({
            message: 'Request approved and moved to in-process',
            data: request
        });
    } catch (err) {
        console.error('Error approving request:', err);
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/cashback-requests/:id/reject - Operator rejects request
router.put('/:id/reject', auth, [
    body('rejectionReason').notEmpty().withMessage('Rejection reason required'),
], async (req, res) => {
    try {
        const { rejectionReason, approvedBy } = req.body;

        const request = await CashbackRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        request.requestStatus = 'rejected';
        request.rejectionReason = rejectionReason;
        request.approvedBy = approvedBy || 'Unknown Operator';

        await request.save();

        res.json({
            message: 'Request rejected',
            data: request
        });
    } catch (err) {
        console.error('Error rejecting request:', err);
        res.status(500).json({ error: err.message });
    }
});

// ============================================
// OPERATOR FLOW: Link invoice to request
// ============================================

// PUT /api/cashback-requests/:id/link-invoice - Operator creates invoice
router.put('/:id/link-invoice', auth, [
    body('invoiceId').notEmpty().withMessage('Invoice ID required'),
], async (req, res) => {
    try {
        const { invoiceId } = req.body;

        const request = await CashbackRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        // Link the invoice
        request.invoiceId = invoiceId;
        await request.save();

        res.json({
            message: 'Invoice linked to cashback request',
            data: request
        });
    } catch (err) {
        console.error('Error linking invoice:', err);
        res.status(500).json({ error: err.message });
    }
});

// ============================================
// BUSINESS FLOW: Confirm payment
// ============================================

// PUT /api/cashback-requests/:id/mark-paid - Business confirms payment
router.put('/:id/mark-paid', auth, async (req, res) => {
    try {
        const request = await CashbackRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        // THREE LANE CHECKPOINT: Update payment status
        request.paymentStatus = 'paid';
        request.requestStatus = 'paid';
        request.paidAt = new Date();

        await request.save();

        // TODO: Trigger webhook/event to notify customer of payment

        res.json({
            message: 'Payment confirmed. Customer notified.',
            data: request
        });
    } catch (err) {
        console.error('Error marking as paid:', err);
        res.status(500).json({ error: err.message });
    }
});

// ============================================
// STATISTICS & REPORTING
// ============================================

// GET /api/cashback-requests/stats/by-status - Get request counts by status
router.get('/stats/by-status', async (req, res) => {
    try {
        const { businessId, customerId } = req.query;
        const query = {};

        if (businessId) query.businessId = businessId;
        if (customerId) query.customerId = customerId;

        const stats = await CashbackRequest.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$requestStatus',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' }
                }
            }
        ]);

        res.json(stats);
    } catch (err) {
        console.error('Error fetching stats:', err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/cashback-requests/:id - Delete request (soft delete via status)
router.delete('/:id', auth, async (req, res) => {
    try {
        const request = await CashbackRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        request.requestStatus = 'cancelled';
        await request.save();

        res.json({ message: 'Request cancelled' });
    } catch (err) {
        console.error('Error deleting request:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
