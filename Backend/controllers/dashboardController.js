import Order from '../models/OrderModal';

 export const calculateDateRange = (timePeriod) => {
    const now = new Date();
    let startDate, endDate;

    switch (timePeriod) {
        case 'daily':
            startDate = new Date(now.setHours(0, 0, 0, 0));
            endDate = new Date(now.setHours(23, 59, 59, 999));
            break;
        case 'weekly':
            startDate = new Date(now.setDate(now.getDate() - 7));
            endDate = new Date();
            break;
        case 'monthly':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date();
            break;
        case 'yearly':
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date();
            break;
        default:
            startDate = null;
            endDate = null;
    }

    return { startDate, endDate };
};

export const customDaterange = async (req, res) => {
    const { startDate: customStartDate, endDate: customEndDate, timePeriod } = req.query;

    try {
        let filter = {};

        if (timePeriod) {
            const { startDate, endDate } = calculateDateRange(timePeriod);
            filter.createdAt = {
                $gte: startDate,
                $lte: endDate,
            };
        } else if (customStartDate && customEndDate) {
            filter.createdAt = {
                $gte: new Date(customStartDate),
                $lte: new Date(customEndDate),
            };
        }

        const orders = await Order.find(filter)
            .populate('userId', 'name email') 
            .populate('orderItems.productId', 'name price'); 

        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching filtered orders:', error);
        res.status(500).json({ message: 'Failed to fetch orders' });
    }
};


