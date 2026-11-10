import { Order, OrderStatus, IOrderItem } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { UserModel } from "../models/user.model.js";

interface OrderItemInput {
  productId: string;
  quantity: number;
  size?: string;
}

export class OrderService {
  static async create(userId: string, items: OrderItemInput[]) {
    let totalAmount = 0;
    const orderItemsData: IOrderItem[] = [];
    const decremented: { productId: string; quantity: number }[] = [];

    try {
      // Verify stock atomically and calculate line totals
      for (const item of items) {
        const product = await Product.findOneAndUpdate(
          { _id: item.productId, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { new: true },
        );

        if (!product) {
          const exists = await Product.findById(item.productId);
          if (!exists) {
            throw new Error(`Product not found: ${item.productId}`);
          }
          throw new Error(
            `Insufficient stock for "${exists.title}". Available: ${exists.stock}, requested: ${item.quantity}`,
          );
        }

        decremented.push({ productId: item.productId, quantity: item.quantity });

        const lineTotal = product.price * item.quantity;
        totalAmount += lineTotal;

        orderItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: product.price,
          size: item.size,
          product: {
            id: (product._id as any).toString(),
            title: product.title,
            price: product.price,
            imageUrls: product.imageUrls,
            category: product.category,
          },
        });
      }
    } catch (err) {
      // Roll back any previously decremented stock on error
      for (const dec of decremented) {
        await Product.findByIdAndUpdate(dec.productId, {
          $inc: { stock: dec.quantity },
        }).catch(() => {});
      }
      throw err;
    }

    const order = await Order.create({
      userId,
      totalAmount,
      items: orderItemsData,
      status: "PENDING",
    });

    return order.toJSON();
  }

  static async getByUser(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments({ userId }),
    ]);

    const formattedOrders = orders.map((o: any) => ({
      ...o,
      id: o._id.toString(),
    }));

    return {
      orders: formattedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getAll(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(),
    ]);

    const userIds = [...new Set(orders.map((o: any) => o.userId).filter(Boolean))];
    const users = userIds.length > 0
      ? await UserModel.find({ _id: { $in: userIds } })
          .select("fullName phoneNumber department yearOfStudy telegramUserName")
          .lean()
      : [];
    const userMap = new Map(users.map((u: any) => [u._id.toString(), u]));

    const formattedOrders = orders.map((o: any) => {
      const buyer = userMap.get(o.userId?.toString());
      return {
        ...o,
        id: o._id.toString(),
        buyer: buyer
          ? {
              fullName: buyer.fullName,
              phoneNumber: buyer.phoneNumber,
              department: buyer.department,
              yearOfStudy: buyer.yearOfStudy,
              telegramUserName: buyer.telegramUserName,
            }
          : undefined,
      };
    });

    return {
      orders: formattedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getById(id: string) {
    const order = await Order.findById(id).lean();
    if (!order) return null;

    let buyer: any = undefined;
    if (order.userId) {
      const user = await UserModel.findById(order.userId)
        .select("fullName phoneNumber department yearOfStudy telegramUserName")
        .lean();
      if (user) {
        buyer = {
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          department: user.department,
          yearOfStudy: user.yearOfStudy,
          telegramUserName: user.telegramUserName,
        };
      }
    }

    return {
      ...order,
      id: (order as any)._id.toString(),
      buyer,
    };
  }

  static async updateStatus(id: string, status: OrderStatus) {
    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true },
    ).lean();

    if (!order) return null;
    return {
      ...order,
      id: (order as any)._id.toString(),
    };
  }
}
