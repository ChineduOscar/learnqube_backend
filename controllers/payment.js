import { StatusCodes } from 'http-status-codes';
import User from '../models/User.js';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
const createPayment = async (req, res) => {
    const { email, amount, courseId } = req.body;
    
    if (!email || !amount) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: "Email and amount are required"
        });
    }
    
    try {
      const amountInKobo = Math.round(parseFloat(amount) * 100);
      
      const response = await axios.post('https://api.paystack.co/transaction/initialize', {
          email,
          amount: amountInKobo,
          callback_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-verification/${courseId}`,
          metadata: {
            courseId,
            custom_fields: [
                {
                    display_name: "Course",
                    variable_name: "course_id",
                    value: courseId
                }
            ]
          },
          channels: ["card"]
      }, {
          headers: {
              'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
              'Content-Type': 'application/json'
          }
      });

      res.status(StatusCodes.OK).json({
          success: true,
          paymentData: response.data,
          checkoutUrl: response.data.data.authorization_url
      });
    } catch (error) {
        console.error('Payment error:', error.response?.data || error.message);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message,
            details: error.response?.data 
        });
    }
};

const verifyPayment = async (req, res) => {
    const { reference } = req.params;
    console.log(reference)
    
    if (!reference) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        success: false, 
        message: 'Transaction reference is required' 
      });
    }
  
    try {
      const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      });
  
      const data = await response.json();

      console.log(data)
  
      if (!data.status || data.data.status !== 'success') {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Payment verification failed'
        });
      }
  
      const courseId = data.data.metadata?.courseId;
      if (!courseId) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Course ID not found in payment metadata'
        });
      }
  
      const updatedUser = await User.findOneAndUpdate(
        { email: data.data.customer.email },
        {
          $push: {
            enrolledCourses: {
              course: courseId,
              paymentStatus: 'completed',
              transactionReference: reference
            }
          }
        },
        { new: true }
      ).populate('enrolledCourses.course');
  
      return res.status(StatusCodes.OK).json({
        success: true,
        message: 'Payment verified successfully',
        enrolledCourses: updatedUser.enrolledCourses
      });
    } catch (error) {
      console.error('Payment verification error:', error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error verifying payment'
      });
    }
  };



export {createPayment, verifyPayment};