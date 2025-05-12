import { EntitySchema } from "typeorm";

export const Cart = new EntitySchema({
  name: "Cart",
  tableName: "Cart",
  columns: {
    id: {
      primary: true,
      type: "bigint",
      generated: true,
    },
    userId: {
      type: "bigint",
      nullable: false,
    },
    total: {
      type: "decimal",
      precision: 10,
      scale: 2,
      default: 0,
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
    user: {
      type: "one-to-one",  // Changed from many-to-one to match User entity
      target: "User",
      inverseSide: "cart",
      joinColumn: {
        name: "userId", 
        referencedColumnName: "id",
      },
    },
    items: {
      type: "one-to-many",
      target: "CartItem",
      inverseSide: "cart",
    },
  },
});
