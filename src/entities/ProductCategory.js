import { EntitySchema } from "typeorm";

export const ProductCategory = new EntitySchema({
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
      onDelete: 'CASCADE',
    },
    category: {
      type: "many-to-one",
      target: "Category",
      joinColumn: {
        name: "category_id",
        referencedColumnName: "id",
      },
      onDelete: 'CASCADE',
    }
  },
});
