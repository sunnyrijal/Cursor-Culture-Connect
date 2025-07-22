module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    type: {
      type: DataTypes.STRING, // e.g., 'group_request', 'event_approval', 'group_announcement', etc.
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    relatedId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'ID of the related entity (e.g., groupRequestId, eventId)',
    },
    relatedType: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Type of the related entity (e.g., "GroupRequest", "Event")',
    }
  });

  Notification.associate = function(models) {
    // A notification belongs to a recipient user
    Notification.belongsTo(models.User, {
      as: 'recipient',
      foreignKey: 'recipientId'
    });
    
    // A notification belongs to a sender user
    Notification.belongsTo(models.User, {
      as: 'sender',
      foreignKey: 'senderId'
    });
  };

  return Notification;
}; 