import { AppDataSource } from "./config/database.js"
import bcrypt from "bcryptjs"
import { Cart, CartItem, Category, Comment, CommentReply, Invoice, Manager, Order, Product, Seller, Store, User } from './entities/index.js';

async function createUserIfNotExists(repo, data) {
  const existing = await repo.findOne({ where: { email: data.email } });
  if (existing) {
    console.log(`${data.role} user already exists`);
    return existing;
  }
  data.password = await bcrypt.hash(data.password, 10);
  const user = repo.create(data);
  await repo.save(user);
  console.log(`${data.role} user created`);
  return user;
}

export async function seedDatabase() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    console.log("Seeding sample data...");

    const userRepo = AppDataSource.getRepository(User);
    const storeRepo = AppDataSource.getRepository(Store);
    const categoryRepo = AppDataSource.getRepository(Category);
    const productRepo = AppDataSource.getRepository(Product);
    const sellerRepo = AppDataSource.getRepository(Seller);
    const managerRepo = AppDataSource.getRepository(Manager);
    const cartRepo = AppDataSource.getRepository(Cart);
    const cartItemRepo = AppDataSource.getRepository(CartItem);
    const orderRepo = AppDataSource.getRepository(Order);
    const invoiceRepo = AppDataSource.getRepository(Invoice);
    const commentRepo = AppDataSource.getRepository(Comment);
    const commentReplyRepo = AppDataSource.getRepository(CommentReply);

    const admin = await createUserIfNotExists(userRepo, {
      firstName: "Admin", lastName: "User",
      email: "admin@example.com", password: "admin123",
      phoneNumber: "1234567890", role: "ADMIN",
      photo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkkCM82V9-rngvGCj8DdegNCm_jtoM2QaAEw&s'
    });

    let store = await storeRepo.findOne({ where: { email: "store@example.com" } });
    if (!store) {
      store = storeRepo.create({
        name: "Sample Store",
        description: "This is a sample store for testing",
        address: "123 Main St",
        phoneNumber: "1234567890",
        email: "store@example.com",
        logo: "https://via.placeholder.com/150",
      });
      await storeRepo.save(store);
      console.log("Store created");
    }

    const seller = await createUserIfNotExists(userRepo, {
      firstName: "Seller", lastName: "User",
      email: "seller@example.com", password: "seller123",
      phoneNumber: "0987654321", role: "SELLER",
    });

    let sellerProfile = await sellerRepo.findOne({ where: { userId: seller.id } });
    if (!sellerProfile) {
      sellerProfile = sellerRepo.create({ userId: seller.id, storeId: store.id });
      await sellerRepo.save(sellerProfile);
      console.log("Seller profile created and linked to store");
    }

    const user = await createUserIfNotExists(userRepo, {
      firstName: "Regular", lastName: "User",
      email: "user@example.com", password: "user123",
      phoneNumber: "5555555555", role: "USER",
    });

    const manager = await createUserIfNotExists(userRepo, {
      firstName: "Manager", lastName: "User",
      email: "manager@example.com", password: "manager123",
      phoneNumber: "1112223333", role: "MANAGER",
    });

    const existingManagerProfile = await managerRepo.findOne({ where: { userId: manager.id } });
    if (!existingManagerProfile) {
      await managerRepo.save(managerRepo.create({ userId: manager.id }));
      console.log("Manager profile created");
    }

    if ((await categoryRepo.count()) === 0) {
      const categories = ["Electronics", "Clothing", "Home & Kitchen", "Books", "Toys"].map(name => ({
        categoryName: name,
        categoryImage: { url: "https://via.placeholder.com/150" },
        status: "active"
      }));
      await categoryRepo.save(categories.map(c => categoryRepo.create(c)));
      console.log("Categories created");
    }

    const savedCategories = await categoryRepo.find();

    if ((await productRepo.count()) === 0) {
      const productData = [
        { name: "Smartphone", price: 699.99, offer: 599.99, qty: 100 },
        { name: "Laptop", price: 1299.99, offer: 1199.99, qty: 50 },
        { name: "T-shirt", price: 29.99, offer: 19.99, qty: 200 },
        { name: "Cookware Set", price: 149.99, offer: 129.99, qty: 70 },
        { name: "Bluetooth Speaker", price: 99.99, offer: 79.99, qty: 120 },
        { name: "Novel", price: 19.99, offer: 14.99, qty: 300 },
        { name: "Gaming Mouse", price: 59.99, offer: 49.99, qty: 80 },
        { name: "Sneakers", price: 89.99, offer: 74.99, qty: 60 },
        { name: "Vacuum Cleaner", price: 199.99, offer: 179.99, qty: 40 },
        { name: "Desk Lamp", price: 39.99, offer: 29.99, qty: 90 },
        { name: "Notebook", price: 9.99, offer: 7.99, qty: 500 },
        { name: "Wireless Charger", price: 45.99, offer: 35.99, qty: 100 }
      ];

      for (let i = 0; i < productData.length; i++) {
        const p = productRepo.create({
          productName: productData[i].name,
          productImage: "https://via.placeholder.com/150",
          productStatus: "active",
          standardPrice: productData[i].price,
          offerPrice: productData[i].offer,
          productDescription: `Description for ${productData[i].name}`,
          productDate: new Date(),
          productQuantity: productData[i].qty,
          store: { id: store.id }
        });
        const savedProduct = await productRepo.save(p);
        const categoryIndex = i % savedCategories.length;
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
    }

    // Refactored Cart Creation Logic
    let createdCart;
    try {
      // First, delete any existing cart and its items for the user
      const existingCart = await cartRepo.findOne({ where: { userId: user.id } });
      if (existingCart) {
        await cartItemRepo.delete({ cartId: existingCart.id });
        await cartRepo.delete({ id: existingCart.id });
        console.log("Existing cart and items deleted");
      }

      // Create a new cart
      createdCart = cartRepo.create({ userId: user.id, total: 0 });
      await cartRepo.save(createdCart);
      console.log("Cart created");

      // Add items to cart
      const products = await productRepo.find({ take: 3 });
      let total = 0;

      for (const p of products) {
        const quantity = 1 + Math.floor(Math.random() * 3);
        const item = cartItemRepo.create({
          cartId: createdCart.id,
          productId: p.id,
          quantity,
          price: p.offerPrice * quantity
        });
        await cartItemRepo.save(item);
        total += item.price;
      }

      createdCart.total = total;
      await cartRepo.save(createdCart);
      console.log("Cart items added and total updated");

      // Create order after cart is successfully created
      const existingOrder = await orderRepo.findOne({ where: { userId: user.id } });
      if (!existingOrder) {
        const order = orderRepo.create({
          orderNumber: `ORD-${Date.now()}`,
          orderStatus: "processing",
          orderDate: new Date(),
          cartId: createdCart.id,
          paymentInfo: "Credit Card",
          country: "United States",
          city: "New York",
          streetAddress: "123 Broadway",
          userId: user.id,
          phoneNumber: user.phoneNumber,
          email: user.email
        });
        const savedOrder = await orderRepo.save(order);

        await invoiceRepo.save(invoiceRepo.create({
          orderId: savedOrder.id,
          userId: user.id,
          sellerId: sellerProfile.id,
          amount: createdCart.total,
          status: "PENDING",
          paymentMethod: "Credit Card"
        }));
        console.log("Order and invoice created");
      }

      // Create additional orders using the same cart
      const allProducts = await productRepo.find();
      const additionalOrdersCount = 3;

      for (let i = 0; i < additionalOrdersCount; i++) {
        // Clear existing cart items
        await cartItemRepo.delete({ cartId: createdCart.id });
        createdCart.total = 0;
        await cartRepo.save(createdCart);

        // Add new items to the existing cart
        const chosenProducts = allProducts.sort(() => 0.5 - Math.random()).slice(0, 4);
        let orderTotal = 0;

        for (const product of chosenProducts) {
          const quantity = Math.floor(Math.random() * 3) + 1;
          const price = product.offerPrice * quantity;

          await cartItemRepo.save(cartItemRepo.create({
            cartId: createdCart.id,
            productId: product.id,
            quantity,
            price
          }));

          orderTotal += price;
        }

        createdCart.total = orderTotal;
        await cartRepo.save(createdCart);

        const order = orderRepo.create({
          orderNumber: `ORD-${Date.now()}-${i}`,
          orderStatus: "completed",
          orderDate: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)), // Each order 1 day apart
          cartId: createdCart.id,
          paymentInfo: "Credit Card",
          country: "United States",
          city: "New York",
          streetAddress: "123 Broadway",
          userId: user.id,
          phoneNumber: user.phoneNumber,
          email: user.email
        });
        const savedOrder = await orderRepo.save(order);

        await invoiceRepo.save(invoiceRepo.create({
          orderId: savedOrder.id,
          userId: user.id,
          sellerId: sellerProfile.id,
          amount: orderTotal,
          status: "PAID",
          paymentMethod: "Credit Card"
        }));
        console.log(`Additional order ${i + 1} created`);
      }
    } catch (error) {
      console.error("Error in cart/order creation:", error);
      throw error;
    }

    // Create comments
    if ((await commentRepo.count()) === 0) {
      const comments = [
        {
          content: "Amazing smartphone!",
          rating: 5,
          userId: user.id,
          productId: 1
        },
        {
          content: "T-shirt is comfortable but the fit is tight.",
          rating: 3,
          userId: user.id,
          productId: 3
        }
      ];

      for (const c of comments) {
        const savedComment = await commentRepo.save(commentRepo.create(c));
        if (c.rating < 4) {
          await commentReplyRepo.save(commentReplyRepo.create({
            content: "Thank you! We'll improve the sizing.",
            commentId: savedComment.id,
            userId: seller.id,
            status: "active"
          }));
        }
      }
      console.log("Comments and replies added");
    }

    console.log("✅ Seeding completed!");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
}

seedDatabase()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed", err);
    process.exit(1);
  });
