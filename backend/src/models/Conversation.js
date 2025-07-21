module.exports = (sequelize, DataTypes) => {
  const Conversation = sequelize.define('Conversation', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    lastMessage: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    lastMessageTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isGroupChat: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });

  Conversation.associate = function(models) {
    // For direct conversations between two users
    Conversation.belongsToMany(models.User, {
      through: 'UserConversations',
      as: 'participants',
      foreignKey: 'conversationId'
    });
    
    // For group conversations
    Conversation.belongsTo(models.Group, {
      foreignKey: 'groupId',
      as: 'group'
    });
    
    // Conversations have many messages
    Conversation.hasMany(models.Message, {
      foreignKey: 'conversationId',
      as: 'messages'
    });
  };

  return Conversation;
}; 