const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const Order = require("../models/Order");


const { generateInvoice } = require("../utils/invoiceService");


exports.createPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: order.pricing.totalAmount * 100,
      currency: "INR",
      receipt: order.orderId,
    });

    order.payment.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.json({
      success: true,
      razorpayOrder,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.payment.status = "Paid";


    // Invoice generation removed
    order.payment.invoiceNumber = "";
    order.payment.invoiceUrl = "";


    const invoice = await generateInvoice(order);

    order.payment.invoiceNumber = invoice.invoiceNo;
    order.payment.invoiceUrl = `/uploads/invoices/${invoice.invoiceNo}.pdf`;
    order.payment.paidAt = new Date();
    order.payment.razorpayPaymentId = razorpay_payment_id;
    order.payment.razorpaySignature = razorpay_signature;

    order.tracking.currentStatus = "Completed";

    await order.save();

    res.json({
      success: true,
      message: "Payment Successful",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};