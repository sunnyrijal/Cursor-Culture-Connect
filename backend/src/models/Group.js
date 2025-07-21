module.exports = (sequelize, DataTypes) => {
  const Group = sequelize.define('Group', {
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
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    memberCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    recentActivity: {
      type: DataTypes.STRING,
      allowNull: true
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    upcomingEvents: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    universityOnly: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    allowedUniversity: {
      type: DataTypes.STRING,
      allowNull: true
    },
    meetingTime: {
      type: DataTypes.STRING,
      allowNull: true
    },
    meetingDate: {
      type: DataTypes.STRING,
      allowNull: true
    },
    meetingLocation: {
      type: DataTypes.STRING,
      allowNull: true
    },
    meetingDays: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: []
    },
    chatId: {
      type: DataTypes.STRING,
      allowNull: true
    }
  });

  Group.associate = function(models) {
    // Groups can have many members (Users)
    Group.belongsToMany(models.User, {
      through: 'UserGroups',
      as: 'members',
      foreignKey: 'groupId'
    });

    // Groups can have officers
    Group.belongsToMany(models.User, {
      through: 'GroupOfficers',
      as: 'officers',
      foreignKey: 'groupId'
    });

    // Groups can have a president
    Group.belongsTo(models.User, {
      foreignKey: 'presidentId',
      as: 'president'
    });

    // Groups can have many events
    Group.hasMany(models.Event, {
      foreignKey: 'groupId',
      as: 'events'
    });

    // Groups can have many media items
    Group.hasMany(models.Media, {
      foreignKey: 'groupId',
      as: 'media'
    });

    // Groups can have many social media links
    Group.hasMany(models.SocialMedia, {
      foreignKey: 'groupId',
      as: 'socialMedia'
    });

    // Groups can have past events
    Group.belongsToMany(models.Event, {
      through: 'GroupPastEvents',
      as: 'pastEvents',
      foreignKey: 'groupId'
    });
  };

  return Group;
}; 