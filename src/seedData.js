const { AppDataSource } = require("./config/database");
const entities = require("./entities");
const bcrypt = require("bcryptjs");

// Initialize database connection
async function seedDatabase() {
  try {
    // Ensure database is initialized
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    console.log("Creating sample data...");

    // Create repositories
    const userRepository = AppDataSource.getRepository(entities.User);
    const storeRepository = AppDataSource.getRepository(entities.Store);
    const categoryRepository = AppDataSource.getRepository(entities.Category);
    const productRepository = AppDataSource.getRepository(entities.Product);
    const sellerRepository = AppDataSource.getRepository(entities.Seller);
    const managerRepository = AppDataSource.getRepository(entities.Manager);

    // Create sample users
    const adminPassword = await bcrypt.hash("admin123", 10);
    const sellerPassword = await bcrypt.hash("seller123", 10);
    const userPassword = await bcrypt.hash("user123", 10);
    const managerPassword = await bcrypt.hash("manager123", 10);

    // Create admin
    const admin = userRepository.create({
      firstName: "Admin",
      lastName: "User",
      email: "admin@example.com",
      password: adminPassword,
      phoneNumber: "1234567890",
      role: "ADMIN",
    });
    await userRepository.save(admin);
    console.log("Admin created");

    // Create store
    const store = storeRepository.create({
      name: "Sample Store",
      description: "This is a sample store for testing",
      address: "123 Main St",
      phoneNumber: "1234567890",
      email: "store@example.com",
      logo: "https://via.placeholder.com/150",
    });
    await storeRepository.save(store);
    console.log("Store created");

    // Create seller
    const seller = userRepository.create({
      firstName: "Seller",
      lastName: "User",
      email: "seller@example.com",
      password: sellerPassword,
      phoneNumber: "0987654321",
      role: "SELLER",
    });
    await userRepository.save(seller);

    // Associate seller with store
    const sellerProfile = sellerRepository.create({
      userId: seller.id,
      storeId: store.id,
    });
    await sellerRepository.save(sellerProfile);
    console.log("Seller created and associated with store");

    // Create regular user
    const user = userRepository.create({
      firstName: "Regular",
      lastName: "User",
      email: "user@example.com",
      password: userPassword,
      phoneNumber: "5555555555",
      role: "USER",
    });
    await userRepository.save(user);
    console.log("Regular user created");

    // Create manager
    const manager = userRepository.create({
      firstName: "Manager",
      lastName: "User",
      email: "manager@example.com",
      password: managerPassword,
      phoneNumber: "1112223333",
      role: "MANAGER",
    });
    await userRepository.save(manager);

    // Associate manager
    const managerProfile = managerRepository.create({
      userId: manager.id, // This should match the property name in the entity
    });
    
    // For debugging
    console.log("Creating manager with userId:", manager.id);
    
    await managerRepository.save(managerProfile);
    console.log("Manager created");

    // Create categories
    const categories = [
      {
        categoryName: "Electronics",
        categoryImage: { url: "https://via.placeholder.com/150" },
        status: "active",
      },
      {
        categoryName: "Clothing",
        categoryImage: { url: "https://via.placeholder.com/150" },
        status: "active",
      },
      {
        categoryName: "Home & Kitchen",
        categoryImage: { url: "https://via.placeholder.com/150" },
        status: "active",
      },
    ];

    for (const categoryData of categories) {
      const category = categoryRepository.create(categoryData);
      console.log("Creating category:", categoryData.categoryName);
      await categoryRepository.save(category);
    }
    console.log("Categories created");

    // Get created categories
    const savedCategories = await categoryRepository.find();

    // Create products
    const products = [
      {
        product_name: "Smartphone",
        product_image: "https://via.placeholder.com/150",
        product_status: "active",
        standard_price: 699.99,
        offer_price: 599.99,
        product_description: "Latest smartphone with amazing features",
        product_date: new Date(),
        product_quantity: 100,
        store_id: store.id,
      },
      {
        product_name: "Laptop",
        product_image: "https://via.placeholder.com/150",
        product_status: "active",
        standard_price: 1299.99,
        offer_price: 1199.99,
        product_description: "Powerful laptop for work and play",
        product_date: new Date(),
        product_quantity: 50,
        store_id: store.id,
      },
      {
        product_name: "T-shirt",
        product_image: "https://via.placeholder.com/150",
        product_status: "active",
        standard_price: 29.99,
        offer_price: 19.99,
        product_description: "Comfortable cotton t-shirt",
        product_date: new Date(),
        product_quantity: 200,
        store_id: store.id,
      },
    ];

    // Save products and associate with categories
    for (let i = 0; i < products.length; i++) {
      // Create product with property names matching the entity
      const product = productRepository.create({
        productName: products[i].product_name,
        productImage: products[i].product_image,
        productStatus: products[i].product_status,
        standardPrice: products[i].standard_price,
        offerPrice: products[i].offer_price,
        productDescription: products[i].product_description,
        productDate: products[i].product_date,
        productQuantity: products[i].product_quantity,
        store: { id: products[i].store_id }
      });
      
      console.log("Creating product:", products[i].product_name);
      const savedProduct = await productRepository.save(product);
      
      // Associate with appropriate category
      const categoryIndex = i % savedCategories.length;
      
      console.log(`Associating product with category: ${savedCategories[categoryIndex].category_name}`);
      
      // Add category to product using the product_categories junction table
      await AppDataSource.createQueryBuilder()
        .insert()
        .into("product_categories")
        .values({
          product_id: savedProduct.id,
          category_id: savedCategories[categoryIndex].id,
        })
        .execute();
    }
    console.log("Products created and associated with categories");

    // Create cart for a regular user
    const cartRepository = AppDataSource.getRepository(entities.Cart);
    const cart = cartRepository.create({
      userId: user.id, // The regular user
      total: 0 // Will be updated when adding items
    });
    const savedCart = await cartRepository.save(cart);
    console.log("Cart created for regular user");

    // Add cart items
    const cartItemRepository = AppDataSource.getRepository(entities.CartItem);
    const cartItems = [
      {
        cartId: savedCart.id,
        productId: 1, // Smartphone
        quantity: 1,
        price: products[0].standard_price
      },
      {
        cartId: savedCart.id,
        productId: 3, // T-shirt
        quantity: 2,
        price: products[2].standard_price * 2
      }
    ];

    for (const cartItemData of cartItems) {
      const cartItem = cartItemRepository.create(cartItemData);
      await cartItemRepository.save(cartItem);
    }
    console.log("Cart items added");

    // Update cart total
    savedCart.total = cartItems.reduce((sum, item) => sum + Number(item.price), 0);
    await cartRepository.save(savedCart);
    console.log("Cart total updated");

    // Create an order for the user
    const orderRepository = AppDataSource.getRepository(entities.Order);
    const order = orderRepository.create({
      orderNumber: `ORD-${Date.now()}`,
      orderStatus: "processing",
      orderDate: new Date(),
      cartId: savedCart.id,
      paymentInfo: "Credit Card",
      country: "United States",
      city: "New York",
      streetAddress: "123 Broadway",
      userId: user.id,
      phoneNumber: user.phoneNumber,
      email: user.email
    });
    const savedOrder = await orderRepository.save(order);
    console.log("Order created");

    // Create an invoice for the order
    const invoiceRepository = AppDataSource.getRepository("Invoice");
    const invoice = invoiceRepository.create({
      orderId: savedOrder.id,
      userId: user.id,
      sellerId: 1, // The seller we created
      amount: savedCart.total,
      status: "PENDING",
      paymentMethod: "Credit Card",
      paymentDate: null // Not paid yet
    });
    await invoiceRepository.save(invoice);
    console.log("Invoice created");

    // Add some product comments/reviews
    const commentRepository = AppDataSource.getRepository("Comment");
    const comments = [
      {
        content: "This smartphone has fantastic features! I love the camera quality.",
        rating: 5,
        userId: user.id,
        productId: 1
      },
      {
        content: "Good laptop but battery life could be better.",
        rating: 4,
        userId: user.id,
        productId: 2
      }
    ];

    for (const commentData of comments) {
      const comment = commentRepository.create(commentData);
      await commentRepository.save(comment);
    }
    console.log("Product comments added");

    // Add comment reply
    const commentReplyRepository = AppDataSource.getRepository("CommentReply");
    const commentReply = commentReplyRepository.create({
      content: "Thank you for your feedback! We're working on improving battery life in future models.",
      commentId: 2, // Reply to the laptop comment
      userId: 2, // The seller replying
      status: "active"
    });
    await commentReplyRepository.save(commentReply);
    console.log("Comment reply added");

    console.log("Sample data creation completed!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    // Don't close the connection here if it's needed elsewhere
  }
}

module.exports = { seedDatabase };

// If this file is run directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("Seed completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seed failed", error);
      process.exit(1);
    });
}