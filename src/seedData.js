import { AppDataSource } from "./config/database.js"
import bcrypt from "bcryptjs"
import { Cart,
  CartItem,
  Category,
  Comment,
  CommentReply,
  Invoice,
  Manager,
  Order,
  Product,
  Seller,
  Store,
  User,
  Roles
} from './entities/index.js';
async function createUserIfNotExists(repo, data, roleEntities) {
  const existing = await repo.findOne({ where: { email: data.email }, relations: ['roles'] });
  if (existing) {
    console.log(`${data.role} user already exists`);
    return existing;
  }

  data.password = await bcrypt.hash(data.password, 10);
  const user = repo.create({ ...data, roles: roleEntities });
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
    const roleRepo = AppDataSource.getRepository(Roles);

    const roleNames = ["ADMIN", "SELLER", "USER", "MANAGER"];
    const rolesMap = {};

    for (const name of roleNames) {
      let role = await roleRepo.findOne({ where: { name } });
      if (!role) {
        role = roleRepo.create({ name });
        await roleRepo.save(role);
        console.log(`Role '${name}' created`);
      }
      rolesMap[name] = role;
    }
    // Clear tables in the correct order to avoid foreign key constraint errors
    await commentReplyRepo.delete({});
    await commentRepo.delete({});
    await invoiceRepo.delete({});
    await orderRepo.delete({});
    await cartItemRepo.delete({});
    await cartRepo.delete({});
    await productRepo.delete({});

    const admin = await createUserIfNotExists(userRepo, {
      firstName: "Admin", lastName: "User",
      email: "admin@example.com", password: "admin123",
      phoneNumber: "1234567890", role: "ADMIN",
      photo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkkCM82V9-rngvGCj8DdegNCm_jtoM2QaAEw&s'
    }, [rolesMap["ADMIN"]]);

    let store = await storeRepo.findOne({ where: { email: "store@example.com" } });
    if (!store) {
      store = storeRepo.create({
        name: "Sample Store",
        description: "This is a sample store for testing",
        address: "123 Main St",
        phoneNumber: "1234567890",
        email: "store@example.com",
        logo: "https://static.vecteezy.com/system/resources/previews/020/662/330/non_2x/store-icon-logo-illustration-vector.jpg",
      });
      await storeRepo.save(store);
      console.log("Store created");
    }

    const seller = await createUserIfNotExists(userRepo, {
      firstName: "Seller", lastName: "User",
      email: "seller@example.com", password: "seller123",
      phoneNumber: "0987654321", role: "SELLER",
      photo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkkCM82V9-rngvGCj8DdegNCm_jtoM2QaAEw&s'
    },[rolesMap["SELLER"]]);

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
      photo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkkCM82V9-rngvGCj8DdegNCm_jtoM2QaAEw&s'
    }, [rolesMap["USER"]]);

    const manager = await createUserIfNotExists(userRepo, {
      firstName: "Manager", lastName: "User",
      email: "manager@example.com", password: "manager123",
      phoneNumber: "1112223333", role: "MANAGER",
      photo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkkCM82V9-rngvGCj8DdegNCm_jtoM2QaAEw&s'

    }, [rolesMap["MANAGER"]]);

    const existingManagerProfile = await managerRepo.findOne({ where: { userId: manager.id } });
    if (!existingManagerProfile) {
      await managerRepo.save(managerRepo.create({ userId: manager.id }));
      console.log("Manager profile created");
    }

    if ((await categoryRepo.count()) === 0) {
      const categories = ["Electronics", "Clothing", "Home & Kitchen", "Books", "Toys"].map(name => ({
        categoryName: name,
        categoryImage: { url: "https://lectera.com/info/storage/img/20220309/b87d52d6ede361b47b0c_808xFull.png" },
        status: "active"
      }));
      await categoryRepo.save(categories.map(c => categoryRepo.create(c)));
      console.log("Categories created");
    }

    // Create some sample products if none exist
    if ((await productRepo.count()) === 0) {
      const electronics = await categoryRepo.findOne({ where: { categoryName: "Electronics" } });
      const product = productRepo.create({
        productName: "Sample Laptop",
        productImage: "https://d2v5dzhdg4zhx3.cloudfront.net/web-assets/images/storypages/primary/ProductShowcasesampleimages/JPEG/Product+Showcase-1.jpg",
        productStatus: "active",
        standardPrice: 999.99,
        offerPrice: 899.99,
        productDescription: "A high-performance laptop",
        productDate: new Date(),
        productQuantity: 10,
        category: [electronics],
        store: store
      });
      await productRepo.save(product);
      console.log("Sample product created");

      // Add sample comments/reviews
      const comments = [
        {
          content: "Great laptop! The performance is amazing and battery life is excellent.",
          rating: 5,
          userId: user.id,
          productId: product.id
        },
        {
          content: "Good value for money. The build quality could be better though.",
          rating: 4,
          userId: seller.id,
          productId: product.id
        },
        {
          content: "Decent laptop but runs a bit hot under heavy load.",
          rating: 3,
          userId: manager.id,
          productId: product.id
        }
      ];

      for (const commentData of comments) {
        const comment = commentRepo.create(commentData);
        await commentRepo.save(comment);
      }
      console.log("Sample reviews created");
    }

    const savedCategories = await categoryRepo.find();

    // if ((await productRepo.count()) === 0) {
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
          productImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cHJvZHVjdHxlbnwwfHwwfHx8MA%3D%3D",
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

      const additionalProducts = [
        { name: "Tablet", price: 499.99, offer: 449.99, qty: 70 },
        { name: "Headphones", price: 199.99, offer: 149.99, qty: 150 },
        { name: "Smartwatch", price: 299.99, offer: 249.99, qty: 90 },
        { name: "Gaming Console", price: 399.99, offer: 349.99, qty: 40 },
        { name: "Camera", price: 599.99, offer: 549.99, qty: 30 },
        { name: "Electric Kettle", price: 49.99, offer: 39.99, qty: 100 },
        { name: "Backpack", price: 79.99, offer: 59.99, qty: 120 },
        { name: "Office Chair", price: 149.99, offer: 129.99, qty: 50 },
        { name: "Monitor", price: 249.99, offer: 199.99, qty: 60 },
        { name: "Keyboard", price: 69.99, offer: 49.99, qty: 80 }
      ];

      for (let i = 0; i < additionalProducts.length; i++) {
        const p = productRepo.create({
          productName: additionalProducts[i].name,
          productImage: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.freepik.com%2Ffree-photos-vectors%2Fproduct&psig=AOvVaw14tNC821-KbWaAm-UbIkYg&ust=1747205429545000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCPDl3tLtn40DFQAAAAAdAAAAABAL",
          productStatus: "active",
          standardPrice: additionalProducts[i].price,
          offerPrice: additionalProducts[i].offer,
          productDescription: `Description for ${additionalProducts[i].name}`,
          productDate: new Date(),
          productQuantity: additionalProducts[i].qty,
          store: { id: store.id }
        });
        console.log(`create product ${i}`);
        
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
      console.log("Additional products created and associated with categories");
    // }

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
          orderStatus: "delivered",
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

      const allComments = await commentRepo.find();

      for (const c of allComments) {
        const savedComment = await commentRepo.save(commentRepo.create(c));
        if (c.rating > 3) {
          await commentReplyRepo.save(commentReplyRepo.create({
            content: "Thank you! We'll improve the sizing.",
            commentId: savedComment.id,
            userId: seller.id,
            status: "active"
          }));
        }
      }
      console.log("Comments and replies added");
    

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
