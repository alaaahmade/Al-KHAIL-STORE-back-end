import Stripe from 'stripe'
import { AppDataSource } from "../config/database.js";
import { Cart, CartItem, Product, Order, User } from "../entities/index.js";
import AppError from "../utils/AppError.js";

// Repositories
const cartRepository = AppDataSource.getRepository(Cart);
const cartItemRepository = AppDataSource.getRepository(CartItem);
const productRepository = AppDataSource.getRepository(Product);
const orderRepository = AppDataSource.getRepository(Order);
const userReposetry = AppDataSource.getRepository(User)

// Create a new cart
const createCart = async (cartData) => {
  const cart = cartRepository.create(cartData);
  return await cartRepository.save(cart);
};

// Get all carts
const getAllCarts = async () => {
  return await cartRepository.find({ relations: ["items"] });
};

// Get cart by ID and check ownership
const getCart = async (id, userId, userRole) => {
  const cart = await cartRepository.findOne({
    where: { id },
    relations: ["items", "items.product"],
  });
  if (!cart) {
    throw new AppError("No cart found with that ID", 404);
  }
  if (cart.userId.toString() !== userId.toString()) {
    throw new AppError("You do not have permission to access this cart", 403);
  }
  return cart;
};

// Update cart
const updateCart = async (id, userId, userRole, updateData) => {
  const cart = await cartRepository.findOne({ where: { id } });
  if (!cart) {
    throw new AppError("No cart found with that ID", 404);
  }
  if (userRole !== 'ADMIN' && userRole !== 'MANAGER' && cart.userId.toString() !== userId.toString()) {
    throw new AppError("You do not have permission to update this cart", 403);
  }
  Object.assign(cart, updateData);
  return await cartRepository.save(cart);
};

// Delete cart
const deleteCart = async (id, userId, userRole) => {
  const cart = await cartRepository.findOne({ where: { id } });
  if (!cart) {
    throw new AppError("No cart found with that ID", 404);
  }
  if (cart.userId.toString() !== userId.toString()) {
    throw new AppError("You do not have permission to delete this cart", 403);
  }
  const result = await cartRepository.delete(id);
  if (result.affected === 0) {
    throw new AppError("No cart found with that ID", 404);
  }
};

// Get cart items
const getCartItems = async (cartId) => {
  return await cartItemRepository.find({ where: { cart: { id: cartId } } });
};

// Add item to cart
const addCartItem = async (cartId, userId, userRole, itemData) => {
  const cart = await cartRepository.findOne({ 
    where: { id: cartId },
    relations: ["items"]
  });
  if (!cart) {
    throw new AppError("Cart not found", 404);
  }
  if ( cart.userId.toString() !== userId.toString()) {
    throw new AppError("You do not have permission to add items to this cart", 403);
  }
  // Check if product exists and has enough stock
  const product = await productRepository.findOne({ where: { id: itemData.productId } });
  if (!product) {
    throw new AppError("Product not found", 404);
  }
  if (parseFloat(product.productQuantity) < (itemData.quantity || 1)) {
    throw new AppError("Not enough product stock", 400);
  }
  // Check if this product is already in the cart, if so, update quantity instead
  const existingItem = cart.items ? cart.items.find(
    item => item.productId.toString() === itemData.productId.toString()
  ) : null;
  let savedItem;
  if (existingItem) {
    existingItem.quantity += itemData.quantity || 1;
    savedItem = await cartItemRepository.save(existingItem);
  } else {
    const item = cartItemRepository.create({ ...itemData, cart });
    savedItem = await cartItemRepository.save(item);
  }
  await updateCartTotal(cart.id);
  return savedItem;
};

// Helper function to update cart total
async function updateCartTotal(cartId) {
  // Get all cart items
  const items = await cartItemRepository.find({ 
    where: { cart: { id: cartId } }
  });
  
  // Calculate total
  let total = 0;
  for (const item of items) {
    total += parseFloat(item.price) * item.quantity;
  }
  
  // Update cart
  await cartRepository.update(cartId, { total });
}

// Update cart item
const updateCartItem = async (itemId, userId, userRole, updateData) => {
  const item = await cartItemRepository.findOne({ 
    where: { id: itemId },
    relations: ["cart"]
  });
  if (!item) {
    throw new AppError("No cart item found with that ID", 404);
  }
  if (item.cart.userId.toString() !== userId.toString()) {
    throw new AppError("You do not have permission to update this item", 403);
  }
  Object.assign(item, updateData);
  const savedItem = await cartItemRepository.save(item);
  if (item.cart && item.cart.id) {
    await updateCartTotal(item.cart.id);
  }
  return savedItem;
};

// Remove item from cart
const removeCartItem = async (itemId, userId, userRole) => {
  const item = await cartItemRepository.findOne({ 
    where: { id: itemId },
    relations: ["cart"] 
  });
  if (!item) {
    throw new AppError("No cart item found with that ID", 404);
  }
  if (item.cart.userId.toString() !== userId.toString()) {
    throw new AppError("You do not have permission to remove this item", 403);
  }
  const cartId = item.cart.id;
  const result = await cartItemRepository.delete(itemId);
  if (result.affected === 0) {
    throw new AppError("Failed to remove cart item", 500);
  }
  await updateCartTotal(cartId);
};

// Get user's cart
const getUserCart = async (userId) => {
  // First, try to find the cart using userId
  try {
    const cart = await cartRepository.findOne({
      where: { userId: userId, status: 'active' },
      relations: ["items", "items.product"]
    });
    
    if (!cart) {
      throw new AppError("No cart found for this user", 404);
    }
    return cart;
  } catch (error) {
    // If there's an error, it might be a relationship issue, try another approach
    if (error.message !== "No cart found for this user") {
      console.error("Error finding cart by userId:", error.message);
    }
    
    // Try direct approach as fallback
    const cart = await cartRepository.findOne({
      where: { userId: userId },
      relations: ["items"]
    });
    
    if (!cart) {
      throw new AppError("No cart found for this user", 404);
    }
    return cart;
  }
};

// Checkout cart
// Checkout cart: Only creates Stripe session and order, does not mutate cart status
const checkoutCart = async (cartId, userId, userRole, orderData) => {
  const orderRepository = AppDataSource.getRepository(Order);
  const cartRepository = AppDataSource.getRepository(Cart);
  const userRepository = AppDataSource.getRepository(User);

  const cart = await cartRepository.findOne({
    where: { id: cartId },
    relations: ["items", "items.product"],
  });
  if (!cart) {
    throw new AppError("No cart found with that ID", 404);
  }
  if (!cart.userId || cart.userId.toString() !== userId.toString()) {
    throw new AppError("You do not have permission to checkout this cart", 403);
  }
  if (!cart.items || cart.items.length === 0) {
    throw new AppError("Cannot checkout an empty cart", 400);
  }
  // Validate all products have a name
  for (const item of cart.items) {
    if (!item.product || !item.product.productName) {
      throw new AppError(`Product with ID ${item.product?.id || 'unknown'} is missing a name. Cannot proceed to checkout.`, 400);
    }
  }
  // Stripe integration
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  
  // Prepare line items
  const line_items = cart.items.map(item => {
    const productData = {
      name: item.product.productName || 'Unnamed Product',
      images: item.product.productImage ? [item.product.productImage] : [],
    };
    if (item.product.productDescription && item.product.productDescription.trim().length > 0) {
      productData.description = item.product.productDescription;
    }
    return {
      price_data: {
        currency: 'usd',
        product_data: productData,
        unit_amount: Math.round(parseFloat(item.price) * 100),
      },
      quantity: item.quantity,
    };
  });
  // Add shipping and tax as separate line items if desired
  if (orderData.shippingFee) {
    line_items.push({
      price_data: {
        currency: 'usd',
        product_data: { name: 'Shipping Fee' },
        unit_amount: Math.round(orderData.shippingFee * 100),
      },
      quantity: 1,
    });
  }
  if (orderData.tax) {
    line_items.push({
      price_data: {
        currency: 'usd',
        product_data: { name: 'Tax' },
        unit_amount: Math.round(orderData.tax * 100),
      },
      quantity: 1,
    });
  }
  // Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items,
    mode: 'payment',
    customer_email: orderData.shipping?.email || orderData.email,
    success_url: `${process.env.FRONTEND_URL}/checkout/confirmation?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/checkout/details`,
    metadata: {
      cartId: cart.id.toString(),
      userId: cart.userId.toString(),
    },
  });  

  // Create the order in DB for reference (optional, can be moved to webhook if you want strict post-payment logic)
  const order = await orderRepository.save({
    cartId: cart.id,
    userId: cart.userId,
    stripeSessionId: session.id,
    orderNumber: `ORD-${Date.now()}`,
    orderStatus: 'Processing',
    orderDate: new Date(),
    paymentInfo: session.payment_intent || session.id || '',
    country: session.shipping?.address?.country || '',
    city: session.shipping?.address?.city || '',
    streetAddress: session.shipping?.address?.line1 || '',
    phoneNumber: session.customer_details?.phone || '',
    email: session.customer_details?.email || session.customer_email || '',
    cart: cart,
  });

  
  // Before creating a new cart, set the old cart's userId to null to avoid unique constraint violation

  await cartRepository.update(cart.id, { userId: null, CheckedUser: userId, status: 'checked_out' });

  // After checkout, create a new empty cart for the user
  const newCart = await cartRepository.save({ userId: userId, total: 0, status: 'active' });

  // Update the user to reference the new cart (must use entity save, not update)
  const user = await userRepository.findOne({ where: { id: userId }, relations: ["cart"] });
  user.cartId = newCart.id;
  await userRepository.save(user);

  // Return sessionId for Stripe redirect, order for confirmation fetch, and new cart
  return { sessionId: session.id, stripeSessionId: session.id, order };
};



export const emptyCart =async (req) => {
  const {id} = req.params
  // const cart = cartId
  if(id === 'undefined') {
    return  new AppError("Cart not found", 404)
  }
  
  const cart = await cartRepository.findOne({ where: { id } });
  
  const cartUser = await userReposetry.findOne({where: {id: cart.userId}})

  
  if (!cart) {
    throw new AppError("Cart not found", 404);
  }

  cart.total = 0;

  await cartRepository.save(cart);

  const cartItemRepository = AppDataSource.getRepository(CartItem);
  return cartItemRepository.delete({ cart: { id } });
  return cart
}

export {
  createCart,
  getAllCarts,
  getCart,
  updateCart,
  deleteCart,
  getCartItems,
  addCartItem,
  updateCartItem,
  removeCartItem,
  getUserCart,
  checkoutCart
};