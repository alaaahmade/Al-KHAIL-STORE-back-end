const { EntitySchema } = require("typeorm");

const Manager = new EntitySchema({
  name: "Manager",
  tableName: "managers",
  columns: {
    id: {
      primary: true,
      type: "bigint",
      generated: true,
    },
    userId: {
      type: "bigint",
      name: "user_id",
      nullable: false,
    },

    createdAt: {
      type: "timestamp",
      name: "created_at",
      default: () => "CURRENT_TIMESTAMP",
    },
    updatedAt: {
      type: "timestamp",
      name: "updated_at",
      default: () => "CURRENT_TIMESTAMP",
      onUpdate: "CURRENT_TIMESTAMP",
    },
  },
  relations: {
    user: {
      type: "many-to-one",
      target: "User",
      joinColumn: {
        name: "user_id",
        referencedColumnName: "id",
      },
    },
  },
});

module.exports = Manager;
