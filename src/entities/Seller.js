import { EntitySchema } from "typeorm";

export const Seller = new EntitySchema({
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
      nullable: true,
    },
    setting: {
      type: "jsonb",
      nullable: false,
      default: JSON.stringify({
        notifications: {
          Order_Updates: true,
          Promotions_Deals: false,
          New_Product_Arrivals: true,
          Push_Notifications: {
            Order_Status_Updates: true,
            Chat_Messages: false,
          },
          Newsletter_Preferences: {
            Weekly_Newsletter: true
          }
        },
        shipping_Address: [
          {
            label: 'Home',
            isDefault: true,
            name: 'Sarah Johnson',
            address: '123 Main Street, Apt 4B',
            city: 'New York, NY 10001',
            country: 'United States',
            phone: '(555) 123-4567',
          },
          {
            label: 'Office',
            isDefault: false,
            name: 'Sarah Johnson',
            address: '456 Business Ave, Floor 12',
            city: 'New York, NY 10002',
            country: 'United States',
            phone: '(555) 987-6543',
          },
        ]
      }) 
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
