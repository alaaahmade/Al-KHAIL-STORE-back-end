import { EntitySchema } from 'typeorm';

export const Message = new EntitySchema({
  name: 'Message',
  tableName: 'messages',
  columns: {
    id: {
      type: 'int',
      primary: true,
      generated: true,
    },
    content: {
      type: 'text',
    },
    createdAt: {
      name: 'created_at',
      type: 'timestamp',
      createDate: true,
    },
    contentType: {
      type: 'varchar',
      nullable: false,
      default: 'text',
    }
  },
  relations: {
    chatRoom: {
      type: 'many-to-one',
      target: 'ChatRoom', // Target entity name
      joinColumn: {
        name: 'chat_room_id',
      },
      nullable: false,
    },
    sender: {
      type: 'many-to-one',
      target: 'User', // Target entity name
      joinColumn: {
        name: 'sender_id',
      },
      nullable: false,
    },
  },
});
