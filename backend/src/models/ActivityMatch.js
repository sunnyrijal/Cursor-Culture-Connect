module.exports = (sequelize, DataTypes) => {
  const ActivityMatch = sequelize.define('ActivityMatch', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    matchScore: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.0
    }
  });

  ActivityMatch.associate = function(models) {
    // ActivityMatch involves two users
    ActivityMatch.belongsTo(models.User, {
      foreignKey: 'user1Id',
      as: 'user1'
    });
    
    ActivityMatch.belongsTo(models.User, {
      foreignKey: 'user2Id',
      as: 'user2'
    });
    
    // ActivityMatch is for a specific activity
    ActivityMatch.belongsTo(models.Activity, {
      foreignKey: 'activityId',
      as: 'activity'
    });
    
    // ActivityMatch has many common availability time slots
    ActivityMatch.belongsToMany(models.TimeSlot, {
      through: 'MatchAvailability',
      as: 'commonTimeSlots',
      foreignKey: 'matchId'
    });
  };

  return ActivityMatch;
}; 