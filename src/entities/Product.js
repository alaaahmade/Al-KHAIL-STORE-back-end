// src/entities/Product.js

import { EntitySchema } from "typeorm";

export const Product = new EntitySchema({
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
    isFeatured: {
      type: "boolean",
      default: true,
      nullable: true
    },
    productGallery : {
      type: 'jsonb',
      nullable: true,
      default: JSON.stringify( ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTixMUT-tvYkn-4K0khhYC3lKHV_mRmBGpc0g&s',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIod4kE9WxLPhpki-0oPMeumyS8DzwkFe3-g&s',
        'https://i.pinimg.com/236x/14/86/86/148686b4a830e06d8089db5cb1e521f4.jpg',
        'https://thumbs.dreamstime.com/b/pink-flowers-float-clear-waters-hawaii-soft-white-sand-below-347952870.jpg'])
    }
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
