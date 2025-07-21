module.exports = (sequelize, DataTypes) => {
  const Activity = sequelize.define('Activity', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    category: {
      type: DataTypes.ENUM('sports', 'fitness', 'volunteering', 'outdoor', 'social', 'cultural', 'hobby'),
      allowNull: false
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    equipment: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: []
    },
    transportation: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    indoor: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    outdoor: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    skillLevel: {
      type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
      allowNull: true
    },
    maxParticipants: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Duration in minutes'
    }
  });

  Activity.associate = function(models) {
    // Activity can have many preferences
    Activity.hasMany(models.ActivityPreference, {
      foreignKey: 'activityId',
      as: 'preferences'
    });
  };

  return Activity;
}; 