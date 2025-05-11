const { EntitySchema } = require("typeorm");

const Order = new EntitySchema({
  name: "Order",
  tableName: "Order",
  columns: {
    id: {
      primary: true,
      type: "bigint",
      generated: true,
    },
    orderNumber: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    orderStatus: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    orderDate: {
      type: "date",
      nullable: false,
    },
    cartId: {
      type: "bigint",
      nullable: false,
    },
    paymentInfo: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    country: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    city: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    streetAddress: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    userId: {
      type: "bigint",
      nullable: false,
    },
    phoneNumber: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    email: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    createdAt: {
      type: "timestamp",
      createDate: true,
    },
    updatedAt: {
      type: "timestamp",
      updateDate: true,
    },
  },
  relations: {
    user: {
      target: "User",
      type: "many-to-one",
      joinColumn: {
        name: "userId",
        referencedColumnName: "id",
      },
    },
    cart: {
      target: "Cart",
      type: "many-to-one",
      joinColumn: {
        name: "cartId",
        referencedColumnName: "id",
      },
    },
  },
});

module.exports = Order;
