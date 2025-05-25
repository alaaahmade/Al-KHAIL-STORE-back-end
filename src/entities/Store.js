import { EntitySchema } from "typeorm";

export const Store = new EntitySchema({
  name: "Store",
  tableName: "Store",
  columns: {
    id: {
      primary: true,
      type: "bigint",
      generated: true,
    },
    name: {
      type: "varchar",
      nullable: false,
    },
    description: {
      type: "text",
      nullable: true,
    },
    logo: {
      type: "varchar",
      nullable: true,
    },
    address: {
      type: "varchar",
      nullable: false,
    },
    phoneNumber: {
      type: "varchar",
      nullable: false,
    },
    email: {
      type: "varchar",
      nullable: false,
    },
    tagline: {
      type: "varchar",
      nullable: true,
      default: "Your one-stop beauty shop",
    },
    storeType: {
      type: "varchar",
      nullable: true,
      default: "Online Store",
    },
    isActive: {
      type: "boolean",
      default: true,
    },
    businessHours: {
      type: "jsonb",
      nullable: true,
      default: JSON.stringify({
    monday: '9:00 AM - 6:00 PM',
    tuesday: '9:00 AM - 6:00 PM',
    wednesday: '9:00 AM - 6:00 PM',
    thursday: '9:00 AM - 6:00 PM',
    friday: '9:00 AM - 8:00 PM',
    saturday: '10:00 AM - 7:00 PM',
    sunday: 'Closed',
  }),
    },
    socialLinks: {
      type: "jsonb",
      nullable: true,
      default: JSON.stringify({
        instagram: 'https://instagram.com/michaelsbeauty',
        facebook: 'https://facebook.com/michaelsbeautystore',
        tiktok: 'https://tiktok.com/@michaelsbeauty',
      }),
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
    seller: {
      type: "one-to-one",
      target: "Seller",
      inverseSide: "store",
      onDelete: 'CASCADE',
    },
    products: {
      type: "one-to-many",
      target: "Product",
      inverseSide: "store",
    },
  },
});
