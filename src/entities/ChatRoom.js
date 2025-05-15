import { EntitySchema } from 'typeorm';

export const ChatRoom = new EntitySchema({
  name: 'ChatRoom',
  tableName: 'chat_rooms',
  columns: {
    id: {
      type: 'int',
      primary: true,
      generated: true,
    },
    status: {
      type: 'varchar',
      nullable: false,
      default: 'urgent',
    },
    createdAt: {
      name: 'created_at',
      type: 'timestamp',
      createDate: true,
    },
    updatedAt: {
      name: 'updated_at',
      type: 'timestamp',
      updateDate: true,
    },
  },
  relations: {
    participants: {
      type: 'many-to-many',
      target: 'User',
      joinTable: {
        name: 'chat_room_participants_user',
        joinColumn: {
          name: 'chatRoomId',
          referencedColumnName: 'id',
        },
        inverseJoinColumn: {
          name: 'userId',
          referencedColumnName: 'id',
        },
      },
      cascade: true,
    },
    messages: {
      type: 'one-to-many',
      target: 'Message',
      inverseSide: 'chatRoom',
    },
  },
});
