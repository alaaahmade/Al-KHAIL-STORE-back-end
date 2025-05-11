const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
    id: {
      primary: true,
      type: "bigint",
      generated: true,
    },
    firstName: {
      type: "varchar",
      nullable: false,
    },
    lastName: {
      type: "varchar",
      nullable: false,
    },
    email: {
      type: "varchar",
      unique: true,
      nullable: false,
    },
    password: {
      type: "varchar",
      nullable: false,
    },
    phoneNumber: {
      type: "varchar",
      nullable: false,
    },
    role: {
      type: "enum",
      enum: ["USER", "SELLER", "MANAGER", "ADMIN"],
      default: "USER",
    },
    isActive: {
      type: "boolean",
      default: true,
    },
    createdAt: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
    },
    updatedAt: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
      onUpdate: "CURRENT_TIMESTAMP",
    },
  },
  relations: {
    comments: {
      type: "one-to-many",
      target: "Comment",
      inverseSide: "user",
    },
    cart: {
      type: "one-to-one",
      target: "Cart",
      inverseSide: "user",
    },
    seller: {
      type: "one-to-one",
      target: "Seller",
      inverseSide: "user",
    },
    manager: {
      type: "one-to-one",
      target: "Manager",
      inverseSide: "user",
    },
  },
});
