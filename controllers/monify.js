import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
const createPayment = async (req, res) => {
    const { amount, customerEmail } = req.body;3512066518

    // Generate a unique transaction reference
    const transactionReference = `TX-${Date.now()}`;
    try {
        const response = await axios.post('https://sandbox.monnify.com/api/v1/merchant/transactions/init-transaction', {
            amount,
            customerEmail,
            paymentReference: transactionReference,
            paymentDescription: "Course Subscription",
            currencyCode: "NGN",
            redirectUrl: `${process.env.FRONTEND_URL}/payment-success`,
            contractCode:"32904822812",
            paymentMethods: ["CARD"],
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.MONIFY_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        res.status(200).json({
            success: true,
            paymentData: response.data,
            checkoutUrl: paymentData.checkoutUrl
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export default createPayment;