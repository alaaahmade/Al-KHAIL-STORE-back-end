

import { EntitySchema } from "typeorm"

export const UserSettings = new EntitySchema({
  name: "UserSettings",
  tableName: "user_settings",
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
    Push_Notifications: {
      type: "jsonb",
      nullable: false,
      default: JSON.stringify({
        Order_Status_Updates: true,
        Chat_Messages: false,
      }),
    },
    Newsletter_Preferences: {
      type: "jsonb",
      nullable: false,
      default: JSON.stringify({
        Weekly_Newsletter: true,
      }),
    },
    notifications: {
      type: "jsonb",
      nullable: false,
      default: JSON.stringify({
        Order_Updates: true,
        Promotions_Deals: false,
        New_Product_Arrivals: true,
      }),
    },
    shipping_Address: {
      type: "jsonb",
      nullable: false,
      default: JSON.stringify([
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
      ]),
    },
  },
  relations: {
    user: {
      type: "one-to-one",
      target: "User",
      joinColumn: {
        name: "userId",
        referencedColumnName: "id",
      },
    },
  },
});
