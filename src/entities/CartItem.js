import { EntitySchema } from "typeorm";

export const CartItem = new EntitySchema({
  name: "CartItem",
  tableName: "CartItem",
  columns: {
    id: {
      primary: true,
      type: "bigint",
      generated: true,
    },
    cartId: {
      type: "bigint",
      nullable: false,
    },
    productId: {
      type: "bigint",
      nullable: false,
    },
    quantity: {
      type: "int",
      nullable: false,
      default: 1,
    },
    price: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: false,
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
    cart: {
      type: "many-to-one",
      target: "Cart",
      inverseSide: "items",
      joinColumn: {
        name: "cartId",
        referencedColumnName: "id",
      },
      onDelete: 'CASCADE',
    },
    product: {
      type: "many-to-one",
      target: "Product",
      joinColumn: {
        name: "productId",
        referencedColumnName: "id",
      },
      onDelete: 'CASCADE',
    }
  },
});
