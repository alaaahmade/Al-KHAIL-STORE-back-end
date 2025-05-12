import { AppDataSource } from "../config/database.js";
import { Cart, CartItem } from "../entities/index.js";
import AppError from "../utils/AppError.js";

// Repositories
const cartRepository = AppDataSource.getRepository(Cart);
const cartItemRepository = AppDataSource.getRepository(CartItem);

// Create a new cart
const createCart = async (cartData) => {
  const cart = cartRepository.create(cartData);
  return await cartRepository.save(cart);
};

// Get all carts
const getAllCarts = async () => {
  return await cartRepository.find({ relations: ["items"] });
};

// Get cart by ID
const getCart = async (id) => {
  const cart = await cartRepository.findOne({
    where: { id },
    relations: ["items"],
  });
  if (!cart) {
    throw new AppError("No cart found with that ID", 404);
  }
  return cart;
};

// Update cart
const updateCart = async (id, updateData) => {
  const cart = await cartRepository.findOne({ where: { id } });
  if (!cart) {
    throw new AppError("No cart found with that ID", 404);
  }
  Object.assign(cart, updateData);
  return await cartRepository.save(cart);
};

// Delete cart
const deleteCart = async (id) => {
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
const addCartItem = async (cartId, itemData) => {
  // Get the cart with its existing items
  const cart = await cartRepository.findOne({ 
    where: { id: cartId },
    relations: ["items"]
  });
  
  if (!cart) {
    throw new AppError("Cart not found", 404);
  }
  
  // Check if product exists in the product repository if needed
  
  // Check if this product is already in the cart, if so, update quantity instead
  const existingItem = cart.items ? cart.items.find(
    item => item.productId.toString() === itemData.productId.toString()
  ) : null;
  
  let savedItem;
  
  if (existingItem) {
    // Update existing item
    existingItem.quantity += itemData.quantity || 1;
    savedItem = await cartItemRepository.save(existingItem);
  } else {
    // Create new item
    const item = cartItemRepository.create({ ...itemData, cart });
    savedItem = await cartItemRepository.save(item);
  }
  
  // Update cart total
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
const updateCartItem = async (itemId, updateData) => {
  const item = await cartItemRepository.findOne({ 
    where: { id: itemId },
    relations: ["cart"]
  });
  
  if (!item) {
    throw new AppError("No cart item found with that ID", 404);
  }
  
  Object.assign(item, updateData);
  const savedItem = await cartItemRepository.save(item);
  
  // Update cart total
  if (item.cart && item.cart.id) {
    await updateCartTotal(item.cart.id);
  }
  
  return savedItem;
};

// Remove item from cart
const removeCartItem = async (itemId) => {
  // First get the item to know which cart to update
  const item = await cartItemRepository.findOne({ 
    where: { id: itemId },
    relations: ["cart"] 
  });
  
  if (!item) {
    throw new AppError("No cart item found with that ID", 404);
  }
  
  const cartId = item.cart.id;
  
  // Delete the item
  const result = await cartItemRepository.delete(itemId);
  if (result.affected === 0) {
    throw new AppError("Failed to remove cart item", 500);
  }
  
  // Update cart total
  await updateCartTotal(cartId);
};

// Get user's cart
const getUserCart = async (userId) => {
  // First, try to find the cart using userId
  try {
    const cart = await cartRepository.findOne({
      where: { userId: userId },
      relations: ["items", "items.product"] // Added items.product to get product details
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
const checkoutCart = async (cartId) => {
  const cart = await cartRepository.findOne({
    where: { id: cartId },
    relations: ["items"],
  });
  
  if (!cart) {
    throw new AppError("No cart found with that ID", 404);
  }
  
  if (!cart.items || cart.items.length === 0) {
    throw new AppError("Cannot checkout an empty cart", 400);
  }
  
  // Calculate the total price from cart items
  let totalPrice = 0;
  for (const item of cart.items) {
    totalPrice += parseFloat(item.price) * item.quantity;
  }
  
  // Update the cart total
  cart.total = totalPrice;
  await cartRepository.save(cart);
  
  // In a real application, you would create an order here
  // and then clear the cart or mark it as checked out
  
  return { 
    message: "Cart checked out successfully",
    cartTotal: totalPrice,
    itemCount: cart.items.length
  };
};


export default {
  getCartItems,
  addCartItem,
  updateCartItem,
  removeCartItem,
  getUserCart,
  checkoutCart,
}