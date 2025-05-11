const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Seller",
  tableName: "Seller",
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
    storeId: {
      type: "bigint",
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
    user: {
      type: "many-to-one",
      target: "User",
      inverseSide: "seller",
      joinColumn: {
        name: "userId",
        referencedColumnName: "id",
      },
    },
    store: {
      type: "many-to-one",
      target: "Store",
      inverseSide: "seller",
      joinColumn: {
        name: "storeId",
        referencedColumnName: "id",
      },
    },
  },
});
