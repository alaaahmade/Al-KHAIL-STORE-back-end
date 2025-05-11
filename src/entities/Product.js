// src/entities/Product.js

const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Product",
  tableName: "Product",
  columns: {
    id: {
      primary: true,
      type: "bigint",
      generated: "increment",
    },
    productName: {
      type: "varchar",
      name: "product_name",
      nullable: false,
    },
    productImage: {
      type: "varchar",
      name: "product_image",
      nullable: false,
    },
    productStatus: {
      type: "varchar",
      name: "product_status",
      nullable: false,
    },
    standardPrice: {
      type: "decimal",
      name: "standard_price",
      precision: 10,
      scale: 2,
      nullable: false,
    },
    offerPrice: {
      type: "decimal",
      name: "offer_price",
      precision: 10,
      scale: 2,
      nullable: true, // العرض ممكن يكون اختياري
    },
    productDescription: {
      type: "text",
      name: "product_description",
      nullable: false,
    },
    productDate: {
      type: "date",
      name: "product_date",
      nullable: false,
    },
    productQuantity: {
      type: "decimal",
      name: "product_quantity",
      precision: 10,
      scale: 2,
      nullable: false,
    },
  },

  relations: {
    store: {
      type: "many-to-one",
      target: "Store",
      joinColumn: {
        name: "store_id",
        referencedColumnName: "id",
      },
      nullable: false,
      eager: true,
    },
    category: {
      // تعديل من "categories" إلى "category"
      type: "many-to-many",
      target: "Category",
      joinTable: {
        name: "product_categories",
        joinColumn: {
          name: "product_id",
          referencedColumnName: "id",
        },
        inverseJoinColumn: {
          name: "category_id",
          referencedColumnName: "id",
        },
      },
      eager: true,
    },
    comments: {
      type: "one-to-many",
      target: "Comment",
      inverseSide: "product",
      cascade: true,
    },
  },
});
