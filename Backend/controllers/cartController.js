import Cart from "../../Backend/models/cartModal.js";
import Product from "../../Backend/models/productModal.js";
import User from "../models/userModel.js";

const addToCart = async (req, res) => {
  const userId = req.params.id;
  const { productId, quantity, price ,offerPrice} = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  if (product.stock < quantity) {
    return res.status(404).json({ message: "Product is out of stock" });
  }
  if (!userId) {
    return res.status(404).json({ message: "User not found" });
  }
  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [{ productId, quantity, price ,offerPrice}] });
    } else {
      const productIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );
      if (productIndex > -1) {
        if (cart.items[productIndex].quantity + quantity > product.stock) {
          return res
            .status(400)
            .json({ message: "Insufficient stock for this product" });
        }
        cart.items[productIndex].quantity += quantity;
      } else {
        cart.items.push({ productId, quantity, price ,offerPrice});
      }
    }
    const totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    if (totalQuantity > 12) {
        return res.status(400).json({ message: "Cart cannot have more than 12 products" });
    }
    

    const exceedsLimit = cart.items.some((item) => item.quantity > 5);
    if (exceedsLimit) {
      return res
        .status(400)
        .json({ message: "Maximum 5 products can be added" });
    }

    await cart.save();
    console.log(cart);

    res.status(200).json({ message: "Item added to cart", cart });
  } catch (error) {
    console.log("Error adding to cart:", error);
    res.status(500).json({ message: "Error adding to cart", error });
  }
};

const getCart = async (req, res) => {
  try {
    const userId = req.params.id;
    console.log("id", userId);
    const cart = await Cart.findOne({ userId })
      .populate("items.productId")
      .populate("items.productId.category");

    if (!cart) {
      return res.status(404).json({ message: "Cart bot found" });
    }

    res.status(200).json({ message: "Cart data fetched successfully",   cart: {
      ...cart.toObject(),
      coupon: cart.coupon 
    }, });
  } catch (error) {
    console.log("Error fetching data", error);

    res.status(500).json({ message: "Error fetching cart data", error });
  }
};

const increaseQuantity = async (req, res) => {
  try {
    console.log(1);
    const { userId, productId } = req.params;
    console.log(req.params);

    const cart = await Cart.findOne({ userId });
    console.log(cart);

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    const item = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }
    item.quantity += 1;
    if (item.quantity > 5) {
      return res.status(400).json({ message: "Maximum 6  product can add" });
    }

    await cart.save();
    res.status(200).json({ message: "Cart quantity updated", cart });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const decreaseQuantity = async (req, res) => {
  try {
    const { userId, productId } = req.params;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    if (item.quantity > 1) {
      item.quantity -= 1;
    }

    await cart.save();

    res.status(200).json({ cart: cart });
  } catch (error) {
    console.log("Error decreasing quantity:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const removeFromCart = async (req, res) => {
  const userId = req.user.id;
  console.log(userId);
  const productId = req.params.productId;
  console.log(productId);
  

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const result = await Cart.updateOne(
      { userId },
      { $pull: { items: { productId } } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    const updatedCart = await Cart.findOne({ userId });

    res
      .status(200)
      .json({ message: "Product removed from cart", cart: updatedCart });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error });
  }
};

const clearCart = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(404).json({ message: "User not found " });
    }
    const cart = await Cart.findOneAndUpdate(
      { userId },
      { items: [] },
      { new: true }
    );
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error clearing cart", error: error.message });
  }
};

export {
  getCart,
  addToCart,
  decreaseQuantity,
  increaseQuantity,
  removeFromCart,
  clearCart,
};
