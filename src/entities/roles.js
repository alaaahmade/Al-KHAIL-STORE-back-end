import { EntitySchema } from "typeorm";

export const Roles = new EntitySchema({
  name: "Roles",
  tableName: "roles",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    name: {
      type: "varchar",
      length: 255,
      nullable: false,
      unique: true,
    },
  },
  relations: {
// In roles.js
users: {
    type: "many-to-many",
    target: "User",
    inverseSide: "roles"
  }

  },
});
