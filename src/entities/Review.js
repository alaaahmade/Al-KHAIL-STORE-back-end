const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Review",
  tableName: "reviews",
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
    productId: {
      type: "bigint",
      nullable: false,
    },
    rating: {
      type: "int",
      nullable: false,
    },
    comment: {
      type: "text",
      nullable: true,
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
      joinColumn: {
        name: "userId",
        referencedColumnName: "id",
      },
    },
    product: {
      type: "many-to-one",
      target: "Product",
      joinColumn: {
        name: "productId",
        referencedColumnName: "id",
      },
    },
  },
});
