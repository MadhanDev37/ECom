import orders from "../../models/orders.js";

export const getOrders = async (req, res, next) => {
  try {
    const orderList = await orders.find().populate('products.product_id');

    const paymentWithTime = orderList.map((order) => {
      const formattedDate = new Date(order.createdAt).toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "short",
          day: "numeric",
        }
      );

      let totalAmount = 0;
      let totalQty=0;
      order.products.forEach(p => {
        totalAmount += p.qty * (p.product_id?.price || 0);
        totalQty +=p.qty;
      });

      return {
        ...order.toObject(),
        createdTime: formattedDate,
        totalAmount,
        totalQty
      };
    });

    console.log(paymentWithTime, 'orders with payment and time');

    res.render('admin/orders/index', {
      pageTitle: "Orders",
      orders: paymentWithTime,
    });
  } catch (err) {
    console.error('Error fetching orders:', err);
    next(err);
  }
};
