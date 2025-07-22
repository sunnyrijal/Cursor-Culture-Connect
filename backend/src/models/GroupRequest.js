module.exports = (sequelize, DataTypes) => {
  const GroupRequest = sequelize.define('GroupRequest', {
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

  GroupRequest.associate = function(models) {
    // A request belongs to a user
    GroupRequest.belongsTo(models.User, {
      as: 'requester',
      foreignKey: 'requesterId'
    });
    
    // A request belongs to a group
    GroupRequest.belongsTo(models.Group, {
      as: 'group',
      foreignKey: 'groupId'
    });
    
    // A request can have a responder (admin who approved/rejected)
    GroupRequest.belongsTo(models.User, {
      as: 'responder',
      foreignKey: 'responderId'
    });
  };

  return GroupRequest;
}; 