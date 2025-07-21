module.exports = (sequelize, DataTypes) => {
  const Event = sequelize.define('Event', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    date: {
      type: DataTypes.STRING,
      allowNull: false
    },
    time: {
      type: DataTypes.STRING,
      allowNull: false
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false
    },
    category: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: []
    },
    organizer: {
      type: DataTypes.STRING,
      allowNull: false
    },
    attendees: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    maxAttendees: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    price: {
      type: DataTypes.STRING,
      allowNull: true
    },
    distance: {
      type: DataTypes.STRING,
      allowNull: true
    },
    universityOnly: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    allowedUniversity: {
      type: DataTypes.STRING,
      allowNull: true
    }
  });

  Event.associate = function(models) {
    // Events belong to a group
    Event.belongsTo(models.Group, {
      foreignKey: 'groupId',
      as: 'group'
    });

    // Events can have many attendees (Users)
    Event.belongsToMany(models.User, {
      through: 'UserEvents',
      as: 'eventAttendees',
      foreignKey: 'eventId'
    });

    // Events can be favorited by many users
    Event.belongsToMany(models.User, {
      through: 'UserFavorites',
      as: 'favoritedBy',
      foreignKey: 'eventId'
    });

    // Events can belong to many groups as past events
    Event.belongsToMany(models.Group, {
      through: 'GroupPastEvents',
      as: 'pastEventGroups',
      foreignKey: 'eventId'
    });
  };

  return Event;
}; 