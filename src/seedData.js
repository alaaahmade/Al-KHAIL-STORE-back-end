import { AppDataSource } from "./config/database.js"
import { productAssets } from './seedAssets.js';
import bcrypt from "bcryptjs"
import { In } from 'typeorm';
import { 
  Cart,
  CartItem,
  Category,
  Comment,
  CommentReply,
  Invoice,
  Order,
  Product,
  Seller,
  Store,
  User,
  Roles,
  ChatRoom, 
  Message, 
  UserSettings
} from './entities/index.js';

async function createUserIfNotExists(repo, data, roleName) {
  const existing = await repo.findOne({ where: { email: data.email }, relations: ['roles'] });
  if (existing) {
    console.log(`${data.role} user already exists`);
    return existing;
  }

  data.password = await bcrypt.hash(data.password, 10);
  const user = repo.create(data);
  await repo.save(user);

  // Always fetch the role by name
  const roleRepo = AppDataSource.getRepository(Roles);
  const verifiedRole = await roleRepo.findOne({ where: { name: roleName } });
  if (!verifiedRole) throw new Error(`Role ${roleName} not found`);

  await repo
    .createQueryBuilder()
    .relation('roles')
    .of(user)
    .add(verifiedRole.id);

  console.log(`${data.role} user created`);
  return user;
}

export async function seedDatabase() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    console.log("Seeding sample data...");

    // Repositories
    const userRepo = AppDataSource.getRepository(User);
    const storeRepo = AppDataSource.getRepository(Store);
    const categoryRepo = AppDataSource.getRepository(Category);
    const productRepo = AppDataSource.getRepository(Product);
    const sellerRepo = AppDataSource.getRepository(Seller);
    const cartRepo = AppDataSource.getRepository(Cart);
    const cartItemRepo = AppDataSource.getRepository(CartItem);
    const orderRepo = AppDataSource.getRepository(Order);
    const invoiceRepo = AppDataSource.getRepository(Invoice);
    const commentRepo = AppDataSource.getRepository(Comment);
    const commentReplyRepo = AppDataSource.getRepository(CommentReply);
    const roleRepo = AppDataSource.getRepository(Roles);
    const chatRoomRepo = AppDataSource.getRepository(ChatRoom);
    const messageRepo = AppDataSource.getRepository(Message);
    const settingsRepo = AppDataSource.getRepository(UserSettings);

    // Roles
    const roleNames = ["ADMIN", "SELLER", "USER"];
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

    // Clear tables
    await commentReplyRepo.delete({});
    await commentRepo.delete({});
    await messageRepo.delete({});
    await chatRoomRepo.delete({});
    await invoiceRepo.delete({});
    await orderRepo.delete({});
    await cartItemRepo.delete({});
    await cartRepo.delete({});
    await productRepo.delete({});
    await sellerRepo.delete({});
    await storeRepo.delete({});
    await userRepo.delete({});
    await categoryRepo.delete({});
    await settingsRepo.delete({});

    // Seed categories
    const categories = [
      { categoryName: 'Electronics', categoryImage: { url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path fill='none' stroke='currentColor' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M7 19.4V4.6a.6.6 0 0 1 .6-.6h8.8a.6.6 0 0 1 .6.6v14.8a.6.6 0 0 1-.6.6H7.6a.6.6 0 0 1-.6-.6m7 .6v2.5M10 20v2.5M14 4V1.5M10 4V1.5M7 12H4.5m15 0H17M7 6.5H4.5m15 0H17m-10 11H4.5m15 0H17'/></svg>" }, status: 'active' },
      { categoryName: 'Clothing', categoryImage: { url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='15' height='15' viewBox='0 0 15 15'><path fill='currentColor' d='M4 2L1 4.5V7h3v6h7V7h3V4.5L11 2H9.5l-2 4l-2-4z'/></svg>" }, status: 'active' },
      { categoryName: 'Home & Kitchen', categoryImage: { url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path fill='none' stroke='currentColor' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 3h8l-1 9H5zm3 15h2v3H7zM20 3v12h-5c-.023-3.681.184-7.406 5-12m0 12v6h-1v-3M8 12v6'/></svg>" }, status: 'active' },
      { categoryName: 'Books', categoryImage: { url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256' viewBox='0 0 256 256'><path fill='currentColor' d='m235.57 193.73l-33.19-157.8a20 20 0 0 0-23.76-15.48l-46.81 10.06a19.82 19.82 0 0 0-11 6.65A20 20 0 0 0 104 28H56a20 20 0 0 0-20 20v160a20 20 0 0 0 20 20h48a20 20 0 0 0 20-20V90.25l25.62 121.82A20 20 0 0 0 169.15 228a20.3 20.3 0 0 0 4.23-.45l46.81-10.06a20.1 20.1 0 0 0 15.38-23.76M148.19 88.65l39-8.38l2.53 12l-39 8.38Zm7.46 35.5l39-8.38l9.16 43.58l-39 8.38Zm24.06-79.39l2.53 12l-39 8.38l-2.53-12ZM60 88h40v80H60Zm40-36v12H60V52ZM60 204v-12h40v12Zm112.29-.76l-2.53-12l39-8.38l2.53 12Z'/></svg>" }, status: 'active' },
      { categoryName: 'Toys', categoryImage: { url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path fill='currentColor' d='M7 20q-1.125 0-1.963-.712T4.05 17.45H2V10.2h2.8L3 8.4l-1 1L.6 8L4 4.6L5.4 6l-1 1l1.4 1.4L7.3 4h9.425l2.025 6.1H22v7.35h-2.05q-.15 1.125-.987 1.838T17 20q-.95 0-1.713-.55T14.2 18H9.8q-.325.9-1.088 1.45T7 20m.4-10H11V6H8.725zm5.6 0h3.6l-1.325-4H13zm-6 8q.425 0 .713-.288T8 17t-.288-.712T7 16t-.712.288T6 17t.288.713T7 18m10 0q.425 0 .713-.288T18 17t-.288-.712T17 16t-.712.288T16 17t.288.713T17 18'/></svg>" }, status: 'active' },
      { categoryName: 'Skincare', categoryImage: { url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><path fill='currentColor' d='M28 20h-2v2h2v6H4v-6h2v-2H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h24a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2'/><circle cx='7' cy='25' r='1' fill='currentColor'/><path fill='currentColor' d='M21 13a2.96 2.96 0 0 0-1.285.3l-2.3-2.3l2.3-2.3A2.96 2.96 0 0 0 21 9a3 3 0 1 0-3-3a3 3 0 0 0 .3 1.285l-2.3 2.3l-2.3-2.3A3 3 0 0 0 14 6a3 3 0 1 0-3 3a2.96 2.96 0 0 0 1.285-.3l2.3 2.3l-2.3 2.3A2.96 2.96 0 0 0 11 13a3 3 0 1 0 3 3a3 3 0 0 0-.3-1.285l2.3-2.3l2.3 2.3A3 3 0 0 0 18 16a3 3 0 1 0 3-3m0-8a1 1 0 1 1-1 1a1 1 0 0 1 1-1M10 6a1 1 0 1 1 1 1a1 1 0 0 1-1-1m1 11a1 1 0 1 1 1-1a1 1 0 0 1-1 1m10 0a1 1 0 1 1 1-1a1 1 0 0 1-1 1'/></svg>" }, status: 'active' }
    ];
    const savedCategories = await categoryRepo.save(categories.map(c => categoryRepo.create(c)));

    // Admin
    const admin = await createUserIfNotExists(userRepo, {
      firstName: "Admin", lastName: "User",
      email: "admin@store.com", password: "admin123",
      phoneNumber: "1000000000", role: "ADMIN",
      photo: 'https://randomuser.me/api/portraits/men/1.jpg',
    }, "ADMIN");
    const adminSettings = await settingsRepo.create({ userId: admin.id });
    await settingsRepo.save(adminSettings);
    admin.settings = adminSettings;
    await userRepo.save(admin);

    // --- Sellers and Stores ---
    const sellerInfos = [
      { firstName: "Alice", lastName: "Smith", email: "alice.seller@store.com", photo: "https://randomuser.me/api/portraits/women/10.jpg" },
      { firstName: "Bob", lastName: "Johnson", email: "bob.seller@store.com", photo: "https://randomuser.me/api/portraits/men/11.jpg" },
      { firstName: "Carol", lastName: "Williams", email: "carol.seller@store.com", photo: "https://randomuser.me/api/portraits/women/12.jpg" }
    ];
    const sellers = [];
    const stores = [];
    for (let i = 0; i < sellerInfos.length; i++) {
      const info = sellerInfos[i];
      const seller = await createUserIfNotExists(userRepo, {
        ...info,
        password: "seller123",
        phoneNumber: `200000000${i}`,
        role: "SELLER"
      }, "SELLER");
      const sellerSettings = await settingsRepo.create({ userId: seller.id });
      await settingsRepo.save(sellerSettings);
      seller.settings = sellerSettings;
      await userRepo.save(seller);
      let store = storeRepo.create({
        name: `${info.firstName}'s Store`,
        description: `Store owned by ${info.firstName} ${info.lastName}`,
        address: `${100 + i} Market St`,
        phoneNumber: `300000000${i}`,
        email: `${info.firstName.toLowerCase()}@store.com`,
        logo: "https://static.vecteezy.com/system/resources/previews/020/662/330/non_2x/store-icon-logo-illustration-vector.jpg",
      });
      store = await storeRepo.save(store);
      let sellerProfile = sellerRepo.create({ userId: seller.id, storeId: store.id });
      sellerProfile = await sellerRepo.save(sellerProfile);
      sellers.push({ user: seller, profile: sellerProfile });
      stores.push(store);
    }

    // --- Buyers/Users ---
    const userInfos = [
      { firstName: "David", lastName: "Brown", email: "david.user@store.com", photo: "https://randomuser.me/api/portraits/men/21.jpg" },
      { firstName: "Eva", lastName: "Davis", email: "eva.user@store.com", photo: "https://randomuser.me/api/portraits/women/22.jpg" },
      { firstName: "Frank", lastName: "Miller", email: "frank.user@store.com", photo: "https://randomuser.me/api/portraits/men/23.jpg" },
      { firstName: "Grace", lastName: "Moore", email: "grace.user@store.com", photo: "https://randomuser.me/api/portraits/women/24.jpg" }
    ];
    const users = [];
    for (let i = 0; i < userInfos.length; i++) {
      const info = userInfos[i];
      const user = await createUserIfNotExists(userRepo, {
        ...info,
        password: "user123",
        phoneNumber: `400000000${i}`,
        role: "USER"
      }, "USER");
      const userSettings = await settingsRepo.create({ userId: user.id });
      await settingsRepo.save(userSettings);
      user.settings = userSettings;
      await userRepo.save(user);
      users.push(user);
    }

    // --- Products for each seller ---
    // Dynamically generate productNames, productImages, and allProducts from productAssets
    const productNames = productAssets.map(p => p.name);
    const productImages = Object.fromEntries(productAssets.map(p => [p.name, p.image]));
    const allProducts = [];
    for (let s = 0; s < sellers.length; s++) {
      for (const asset of productAssets) {
        // Generate productGalleries for all products from productAssets
        const productGalleries = Object.fromEntries(productAssets.map(a => [
          a.name,
          Array.isArray(a.gallery) && a.gallery.length > 0 ? a.gallery : [a.image]
        ]));

        // Assign price, offer, qty as before
        const price = 100 + Math.floor(Math.random() * 900);
        const offer = price - Math.floor(Math.random() * 50);
        const qty = 10 + Math.floor(Math.random() * 90);

        const product = productRepo.create({
          productName: asset.name,
          productImage: asset.image || "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
          productGallery: productGalleries[asset.name] || [],
          productStatus: "active",
          standardPrice: price,
          offerPrice: offer,
          productDescription: `A great ${asset.name.toLowerCase()} from ${stores[s].name}`,
          productDate: new Date(),
          productQuantity: qty,
          // Assign category based on the product's category in productAssets
          category: [
            savedCategories.find(cat => cat.categoryName === asset.category) || savedCategories[0]
          ],
          store: stores[s]
        });
        const savedProduct = await productRepo.save(product);
        allProducts.push(savedProduct);
      }
    }

    // --- Comments and Replies ---
    for (let i = 0; i < allProducts.length; i++) {
      const product = allProducts[i];
      // Only create comments for products with a valid ID
      if (!product.id) continue;
      // 2 random users comment on each product
      for (let j = 0; j < 2; j++) {
        const user = users[(i + j) % users.length];
        const productDisplayName = product.productName || product.name || 'product';
        const comment = commentRepo.create({
          content: `This ${productDisplayName} is ${["amazing", "good", "average", "not bad"][j % 4]}!`,
          rating: 3 + (j % 3),
          userId: user.id,
          productId: product.id
        });
        const savedComment = await commentRepo.save(comment);
        // Each comment gets a reply from a seller
        const seller = sellers[(i + j) % sellers.length].user;
        const reply = commentReplyRepo.create({
          content: `Thanks for your feedback, ${user.firstName}!`,
          userId: seller.id,
          commentId: savedComment.id
        });
        await commentReplyRepo.save(reply);
      }
    }

    // --- Chat Rooms and Messages ---
    // 1. Each user chats with each seller
    for (const user of users) {
      for (const sellerObj of sellers) {
        let chatRoom = chatRoomRepo.create({ participants: [user, sellerObj.user] });
        chatRoom = await chatRoomRepo.save(chatRoom);
        const messages = [
          { sender: user, chatRoom, content: `Hi, I'm interested in your products!` },
          { sender: sellerObj.user, chatRoom, content: `Hello ${user.firstName}, feel free to ask any questions.` },
          { sender: user, chatRoom, content: `What is the warranty on your best seller?` },
          { sender: sellerObj.user, chatRoom, content: `Most products have a 1-year warranty.` }
        ];
        for (const msg of messages) {
          await messageRepo.save(messageRepo.create(msg));
        }
      }
    }
    // 2. Admin joins some chats
    for (let i = 0; i < users.length; i++) {
      let chatRoom = chatRoomRepo.create({ participants: [users[i], admin] });
      chatRoom = await chatRoomRepo.save(chatRoom);
      const messages = [
        { sender: users[i], chatRoom, content: `Hi Admin, I need help with my order.` },
        { sender: admin, chatRoom, content: `Hello ${users[i].firstName}, how can I assist you?` }
      ];
      for (const msg of messages) {
        await messageRepo.save(messageRepo.create(msg));
      }
    }

    // --- Carts, Orders, Invoices for each user ---
    for (const user of users) {
      let cart = cartRepo.create({ userId: user.id, total: 0 });
      cart = await cartRepo.save(cart);
      let total = 0;
      // Add 2 random valid products to cart
      const validCartProducts = allProducts.filter(p => p.id && typeof p.offerPrice === 'number' && !isNaN(p.offerPrice));
      const cartProducts = validCartProducts.sort(() => 0.5 - Math.random()).slice(0, 2);
      for (const p of cartProducts) {
        if (!p.id || typeof p.offerPrice !== 'number' || isNaN(p.offerPrice)) continue;
        const quantity = 1 + Math.floor(Math.random() * 2);
        const item = cartItemRepo.create({
          cartId: cart.id,
          productId: p.id,
          quantity,
          price: p.offerPrice * quantity
        });
        await cartItemRepo.save(item);
        total += item.price;
      }
      cart.total = total;
      cart.status = 'checked_out';
      await cartRepo.save(cart);
      // Create an order
      const order = orderRepo.create({
        orderNumber: `ORD-${Date.now()}-${user.id}`,
        orderStatus: user.id % 2 === 0 ? "processing" : "delivered",
        orderDate: new Date(),
        cartId: cart.id,
        paymentInfo: "Credit Card",
        country: "Country",
        city: "City",
        streetAddress: "123 Main St",
        userId: user.id,
        phoneNumber: user.phoneNumber,
        email: user.email
      });
      const savedOrder = await orderRepo.save(order);
      // Invoice
      await invoiceRepo.save(invoiceRepo.create({
        orderId: savedOrder.id,
        userId: user.id,
        sellerId: sellers[0].profile.id,
        amount: cart.total,
        status: "PENDING",
        paymentMethod: "Credit Card"
      }));
    }

    console.log("Realistic sample data seeded successfully!");
  } catch (err) {
    console.error("Seed failed", err);
    process.exit(1);
  }
}

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
    const cartRepo = AppDataSource.getRepository(Cart);
    const cartItemRepo = AppDataSource.getRepository(CartItem);
    const orderRepo = AppDataSource.getRepository(Order);
    const invoiceRepo = AppDataSource.getRepository(Invoice);
    const commentRepo = AppDataSource.getRepository(Comment);
    const commentReplyRepo = AppDataSource.getRepository(CommentReply);
    const roleRepo = AppDataSource.getRepository(Roles);
    const chatRoomRepo = AppDataSource.getRepository(ChatRoom);
    const messageRepo = AppDataSource.getRepository(Message);
    const settingsRepo = AppDataSource.getRepository(UserSettings);

    const roleNames = ["ADMIN", "SELLER", "USER"];
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
    await messageRepo.delete({});
    await chatRoomRepo.delete({});
    await invoiceRepo.delete({});
    await orderRepo.delete({});
    await cartItemRepo.delete({});
    await cartRepo.delete({});
    await productRepo.delete({});


    const admin = await createUserIfNotExists(userRepo, {
      firstName: "Admin", lastName: "User",
      email: "admin@example.com", password: "admin123",
      phoneNumber: "1234567890", role: "ADMIN",
      photo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkkCM82V9-rngvGCj8DdegNCm_jtoM2QaAEw&s',
      // settings: adminSettings
    }, "ADMIN");

    const adminSettings = await settingsRepo.create({userId: admin.id})
    await settingsRepo.save(adminSettings)

    admin.settings = adminSettings;
    await userRepo.save(admin);

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
      photo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkkCM82V9-rngvGCj8DdegNCm_jtoM2QaAEw&s',
    }, "SELLER");

    const sellerSettings = await settingsRepo.create({userId: seller.id})
    await settingsRepo.save(sellerSettings)

    seller.settings = sellerSettings;
await userRepo.save(seller);
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
      photo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkkCM82V9-rngvGCj8DdegNCm_jtoM2QaAEw&s',
    }, "USER");


    const userSettings = await settingsRepo.create({userId: user.id})
    await settingsRepo.save(userSettings)

    user.settings = userSettings;
    await userRepo.save(user);


    if ((await categoryRepo.count()) === 0) {
      const categories = ["Electronics", "Clothing", "Home & Kitchen", "Books", "Toys", "Skincare"].map(name => ({
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
          userId: user.id,
          productId: product.id
        }
      ];

      for (const commentData of comments) {
        const comment = commentRepo.create(commentData);
        await commentRepo.save(comment);
      }
      console.log("Sample reviews created");
    }

    // Seed Chat Rooms and Messages
    if (user && seller && admin) { 
      console.log("Seeding chat rooms and messages...");

      // Chat 1: User and Seller
      let chatRoom1 = await chatRoomRepo.findOne({
        where: [
          { participants: { id: In([user.id, seller.id]) } }, 
        ],
        relations: ['participants']
      });

      // More robust check for existing 1-on-1 chat between user and seller
      const roomsOfUser = await chatRoomRepo.createQueryBuilder('chatRoom')
        .innerJoin('chatRoom.participants', 'p1')
        .where('p1.id = :userId', { userId: user.id })
        .leftJoinAndSelect('chatRoom.participants', 'allParticipants')
        .getMany();
      
      chatRoom1 = null; 
      for (const room of roomsOfUser) {
        const participantIds = room.participants.map(p => p.id);
        if (participantIds.includes(seller.id) && room.participants.length === 2) {
          chatRoom1 = room;
          break;
        }
      }

      if (!chatRoom1) {
        chatRoom1 = chatRoomRepo.create({
          participants: [user, seller]
        });
        await chatRoomRepo.save(chatRoom1);
        console.log("Chat room created between User and Seller");
      } else {
        console.log("Chat room between User and Seller already exists");
      }

      // Messages for Chat 1
      const messagesChat1 = [
        { sender: user, chatRoom: chatRoom1, content: "Hello, I have a question about the Sample Laptop. Is it new or refurbished?" },
        { sender: seller, chatRoom: chatRoom1, content: "Hi there! The Sample Laptop is brand new, in its original packaging." },
        { sender: user, chatRoom: chatRoom1, content: "Great, thanks! And what's the warranty on it?" },
        { sender: seller, chatRoom: chatRoom1, content: "It comes with a 1-year manufacturer warranty." },
      ];
      for (const msgData of messagesChat1) {
        const existingMsg = await messageRepo.findOne({where: {content: msgData.content, sender: {id: msgData.sender.id}, chatRoom: {id: msgData.chatRoom.id}}});
        if (!existingMsg) {
            const message = messageRepo.create(msgData);
            await messageRepo.save(message);
        }
      }
      console.log("Messages seeded for User-Seller chat");

      // Chat 2: Admin and User (e.g., a support query)
      let chatRoom2 = null;
      const roomsOfAdmin = await chatRoomRepo.createQueryBuilder('chatRoom')
        .innerJoin('chatRoom.participants', 'p1')
        .where('p1.id = :userId', { userId: admin.id })
        .leftJoinAndSelect('chatRoom.participants', 'allParticipants')
        .getMany();

      for (const room of roomsOfAdmin) {
        const participantIds = room.participants.map(p => p.id);
        if (participantIds.includes(user.id) && room.participants.length === 2) {
          chatRoom2 = room;
          break;
        }
      }

      if (!chatRoom2) {
        chatRoom2 = chatRoomRepo.create({
          participants: [admin, user]
        });
        await chatRoomRepo.save(chatRoom2);
        console.log("Chat room created between Admin and User");
      } else {
        console.log("Chat room between Admin and User already exists");
      }

      // Messages for Chat 2
      const messagesChat2 = [
        { sender: user, chatRoom: chatRoom2, content: "Hello Admin, I'm having trouble with my order #12345. It shows as delivered but I haven't received it." },
        { sender: admin, chatRoom: chatRoom2, content: "Hello! I'm sorry to hear that. Let me check the details for order #12345 for you." },
        { sender: admin, chatRoom: chatRoom2, content: "Okay, I see the tracking information. It seems it was marked delivered by the courier. Could you please double-check with your household members or neighbors?" },
        { sender: user, chatRoom: chatRoom2, content: "I've checked, and no one has seen it. What are the next steps?" },
      ];
      for (const msgData of messagesChat2) {
        const existingMsg = await messageRepo.findOne({where: {content: msgData.content, sender: {id: msgData.sender.id}, chatRoom: {id: msgData.chatRoom.id}}});
        if (!existingMsg) {
            const message = messageRepo.create(msgData);
            await messageRepo.save(message);
        }
      }
      console.log("Messages seeded for Admin-User chat");
    } else {
      console.log("Skipping chat seeding as one or more required users (user, seller, admin) were not found.");
    }

    const savedCategories = await categoryRepo.find();

    // Use productAssets to assign correct category and image
    // Generate productData from productAssets with default/random prices and quantities
    const productData = productAssets.map(asset => {
      // Assign price based on category or random (for demo purposes)
      let basePrice = 19.99;
      switch(asset.category) {
        case 'Electronics': basePrice = 99 + Math.random() * 900; break;
        case 'Clothing': basePrice = 15 + Math.random() * 85; break;
        case 'Home & Kitchen': basePrice = 30 + Math.random() * 170; break;
        case 'Books': basePrice = 8 + Math.random() * 22; break;
        case 'Toys': basePrice = 10 + Math.random() * 40; break;
        case 'Skincare': basePrice = 20 + Math.random() * 60; break;
        default: basePrice = 19.99 + Math.random() * 80;
      }
      basePrice = Math.round(basePrice * 100) / 100;
      const offer = Math.round((basePrice * (0.7 + Math.random() * 0.2)) * 100) / 100; // Offer is 70-90% of price
      const qty = Math.floor(30 + Math.random() * 170); // Between 30 and 200
      return {
        name: asset.name,
        price: basePrice,
        offer: offer,
        qty: qty
      };
    });

    for (let i = 0; i < productData.length; i++) {
      const asset = productAssets.find(a => a.name.toLowerCase() === productData[i].name.toLowerCase());
      // Fallbacks
      const productCategoryName = asset ? asset.category : savedCategories[0].categoryName;
      const productImage = asset ? asset.image : "https://images.unsplash.com/photo-1505740420928-5e560c06d30e";
      const categoryObj = savedCategories.find(cat => cat.categoryName === productCategoryName) || savedCategories[0];
      const p = productRepo.create({
        productName: productData[i].name,
        productImage: productImage,
        productStatus: "active",
        standardPrice: productData[i].price,
        offerPrice: productData[i].offer,
        productDescription: `Description for ${productData[i].name}`,
        productDate: new Date(),
        productQuantity: productData[i].qty,
        store: { id: store.id }
      });
      const savedProduct = await productRepo.save(p);
      await AppDataSource.createQueryBuilder()
        .insert()
        .into("product_categories")
        .values({
          product_id: savedProduct.id,
          category_id: categoryObj.id,
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
      const asset = productAssets.find(a => a.name.toLowerCase() === additionalProducts[i].name.toLowerCase());
      const productCategoryName = asset ? asset.category : savedCategories[0].categoryName;
      const productImage = asset ? asset.image : "https://images.unsplash.com/photo-1505740420928-5e560c06d30e";
      const categoryObj = savedCategories.find(cat => cat.categoryName === productCategoryName) || savedCategories[0];
      const p = productRepo.create({
        productName: additionalProducts[i].name,
        productImage: productImage,
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
      await AppDataSource.createQueryBuilder()
        .insert()
        .into("product_categories")
        .values({
          product_id: savedProduct.id,
          category_id: categoryObj.id,
        })
        .execute();
    }
    console.log("Additional products created and associated with categories");

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
          price: p.offerPrice * quantity,
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
          orderDate: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)), 
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


seedDatabase()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed", err);
    process.exit(1);
  });
