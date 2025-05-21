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
      nullable: true,
    },
    CheckedUser: {
      type: "bigint",
      nullable: true,
      default: null
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
    status: {
      type: "varchar",
      default: 'active', // 'active', 'checked_out', 'inactive'
    },
  },
  relations: {
    user: {
      type: "one-to-one", 
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
