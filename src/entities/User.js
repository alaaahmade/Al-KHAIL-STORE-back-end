import { EntitySchema } from "typeorm"

export const User = new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
    id: {
      primary: true,
      type: "bigint",
      generated: true,
    },
    firstName: {
      type: "varchar",
      nullable: false,
    },
    lastName: {
      type: "varchar",
      nullable: false,
    },
    email: {
      type: "varchar",
      unique: true,
      nullable: false,
    },
    lastActiveAt: {
      type: "timestamp",
      nullable: true,
      default: new Date()
    },
    password: {
      type: "varchar",
      nullable: false,
    },
    photo: {
      type: "text",
      nullable: true,
    },
    phoneNumber: {
      type: "varchar",
      nullable: false,
    },
    role: {
      type: "enum",
      enum: ["USER", "SELLER", "MANAGER", "ADMIN"],
      default: "USER",
    },
    isActive: {
      type: "boolean",
      default: false,
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
    stripeCustomerId: {
      type: "varchar",
      nullable: true,
      unique: true,
    },
    status: {
      type: "varchar",
      nullable: false,
      default: "ACTIVE",
    },
  },
  relations: {
    comments: {
      type: "one-to-many",
      target: "Comment",
      inverseSide: "user",
      onDelete: 'CASCADE',
    },
    cart: {
      type: "one-to-one",
      target: "Cart",
      inverseSide: "user",
      onDelete: 'CASCADE',
    },
    seller: {
      type: "one-to-one",
      target: "Seller",
      inverseSide: "user",
      onDelete: 'CASCADE',
    },

    manager: {
      type: "one-to-one",
      target: "Manager",
      inverseSide: "user",
      onDelete: 'CASCADE',
    },
    roles: {
      type: "many-to-many",
      target: "Roles",
      joinTable: {
        name: "roles_users_users",
        joinColumn: {
          name: "usersId",
          referencedColumnName: "id"
        },
        inverseJoinColumn: {
          name: "rolesId",
          referencedColumnName: "id"
        }
      },
      inverseSide: "users",
    },
    lastOrder: {
      type: "one-to-one",
      target: "Order",
      inverseSide: "user",
      onDelete: 'CASCADE',
    },
    settings: {
      type: "one-to-one",
      target: "UserSettings",
      inverseSide: "user",
      onDelete: 'CASCADE',
    },
  },
});
