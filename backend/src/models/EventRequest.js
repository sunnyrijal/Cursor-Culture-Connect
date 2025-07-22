module.exports = (sequelize, DataTypes) => {
  const EventRequest = sequelize.define('EventRequest', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    }
  });

  EventRequest.associate = function(models) {
    // A request belongs to an event
    EventRequest.belongsTo(models.Event, {
      as: 'event',
      foreignKey: 'eventId'
    });
    
    // A request belongs to a creator (who requested event approval)
    EventRequest.belongsTo(models.User, {
      as: 'creator',
      foreignKey: 'creatorId'
    });
    
    // A request can have a responder (admin who approved/rejected)
    EventRequest.belongsTo(models.User, {
      as: 'responder',
      foreignKey: 'responderId'
    });
  };

  return EventRequest;
}; 