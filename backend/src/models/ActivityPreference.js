module.exports = (sequelize, DataTypes) => {
  const ActivityPreference = sequelize.define('ActivityPreference', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    isOpen: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    locationRadius: {
      type: DataTypes.INTEGER,
      defaultValue: 10,  // Default 10 miles/km
      comment: 'Location radius in miles/km'
    },
    equipment: {
      type: DataTypes.ENUM('have', 'need', 'can_share', 'not_needed'),
      defaultValue: 'not_needed'
    },
    transportation: {
      type: DataTypes.ENUM('have_car', 'need_ride', 'can_drive', 'public_transit', 'walking_distance'),
      defaultValue: 'walking_distance'
    },
    skillLevel: {
      type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
      defaultValue: 'beginner'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  });

  ActivityPreference.associate = function(models) {
    // ActivityPreference belongs to a user
    ActivityPreference.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });

    // ActivityPreference belongs to an activity
    ActivityPreference.belongsTo(models.Activity, {
      foreignKey: 'activityId',
      as: 'activity'
    });
    
    // ActivityPreference has many availability time slots
    ActivityPreference.hasMany(models.Availability, {
      foreignKey: 'preferenceId',
      as: 'availability'
    });
  };

  return ActivityPreference;
}; 