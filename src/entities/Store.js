const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Store",
  tableName: "Store",
  columns: {
    id: {
      primary: true,
      type: "bigint",
      generated: true,
    },
    name: {
      type: "varchar",
      nullable: false,
    },
    description: {
      type: "text",
      nullable: true,
    },
    logo: {
      type: "varchar",
      nullable: true,
    },
    address: {
      type: "varchar",
      nullable: false,
    },
    phoneNumber: {
      type: "varchar",
      nullable: false,
    },
    email: {
      type: "varchar",
      nullable: false,
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
    seller: {
      type: "one-to-one",
      target: "Seller",
      inverseSide: "store",
    },
    products: {
      type: "one-to-many",
      target: "Product",
      inverseSide: "store",
    },
  },
});
