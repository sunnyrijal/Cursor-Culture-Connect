module.exports = (sequelize, DataTypes) => {
  const ActivityRequest = sequelize.define('ActivityRequest', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    proposedDateTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'declined', 'cancelled'),
      defaultValue: 'pending'
    }
  });

  ActivityRequest.associate = function(models) {
    // ActivityRequest is sent by a requester (User)
    ActivityRequest.belongsTo(models.User, {
      foreignKey: 'requesterId',
      as: 'requester'
    });
    
    // ActivityRequest is received by a recipient (User)
    ActivityRequest.belongsTo(models.User, {
      foreignKey: 'recipientId',
      as: 'recipient'
    });
    
    // ActivityRequest is for a specific activity
    ActivityRequest.belongsTo(models.Activity, {
      foreignKey: 'activityId',
      as: 'activity'
    });
  };

  return ActivityRequest;
}; 