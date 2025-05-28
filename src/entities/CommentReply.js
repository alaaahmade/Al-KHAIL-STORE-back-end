import { EntitySchema } from "typeorm";

export const CommentReply = new EntitySchema({
  name: "CommentReply",
  tableName: "comment_replies",
  columns: {
    id: {
      primary: true,
      type: "bigint",
      generated: true,
    },
    content: {
      type: "text",
      nullable: false,
    },
    commentId: {
      type: "bigint",
      name: "comment_id",
      nullable: false,
    },
    userId: {
      type: "bigint",
      name: "user_id",
      nullable: false,
    },
    status: {
      type: "varchar",
      nullable: false,
      default: "active",
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
    files: {
      type: "simple-json",
      nullable: true,
      default: null,
      comment: 'Array of file objects: { url, type, text? }',
    },
  },
  relations: {
    comment: {
      type: "many-to-one",
      target: "Comment",
      joinColumn: {
        name: "comment_id",
        referencedColumnName: "id",
      },
      onDelete: 'CASCADE',
    },
    user: {
      type: "many-to-one",
      target: "User",
      joinColumn: {
        name: "user_id",
        referencedColumnName: "id",
      },
      onDelete: 'CASCADE',
    }
  },
});
