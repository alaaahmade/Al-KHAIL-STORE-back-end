const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Comment",
  tableName: "comments",
  columns: {
    id: {
      primary: true,
      type: "bigint",
      generated: true,
    },
    content: {
      type: "text",
      nullable: false,
    },
    rating: {
      type: "int",
      nullable: false,
    },
    userId: {
      type: "bigint",
      nullable: false,
    },
    productId: {
      type: "bigint",
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
    user: {
      type: "many-to-one",
      target: "User",
      inverseSide: "comments",
      joinColumn: {
        name: "userId",
        referencedColumnName: "id",
      },
    },
    product: {
      type: "many-to-one",
      target: "Product",
      inverseSide: "comments",
      joinColumn: {
        name: "productId",
        referencedColumnName: "id",
      },
    },
  },
});
