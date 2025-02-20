import Pricing from '../models/Pricing.js';

const getAllPricing = async (req, res) => {
    try {
        const pricing = await Pricing.find({});
        res.status(200).json(pricing);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export default getAllPricing;
