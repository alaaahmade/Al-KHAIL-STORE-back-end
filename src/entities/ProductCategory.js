const { EntitySchema } = require("typeorm");

const ProductCategory = new EntitySchema({
  name: "ProductCategory",
  tableName: "product_categories",
  columns: {
    productId: {
      primary: true,
      type: "bigint",
      name: "product_id",
      nullable: false,
    },
    categoryId: {
      primary: true,
      type: "bigint",
      name: "category_id",
      nullable: false,
    },
  },
  relations: {
    product: {
      type: "many-to-one",
      target: "Product",
      joinColumn: {
        name: "product_id",
        referencedColumnName: "id",
      },
    },
    category: {
      type: "many-to-one",
      target: "Category",
      joinColumn: {
        name: "category_id",
        referencedColumnName: "id",
      },
    },
  },
});

module.exports = ProductCategory;
