import { Schema, model } from 'mongoose';

const PricingSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  price: {
    type: Number,
    required: true,
  },
  period: {
    type: String,
    required: true,
    enum: ["forever", "per month", "per year"],
  },
  description: {
    type: String,
    required: true,
  },
  features: {
    type: [String],
    required: true,
  },
  buttonText: {
    type: String,
    required: true,
  },
  buttonVariant: {
    type: String,
    enum: ["outline", "default"],
    default: "default",
  },
  popular: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const Pricing = model("Pricing", PricingSchema);

export default Pricing;
