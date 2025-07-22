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
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    date: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    time: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
    },
    organizer: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    maxAttendees: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    price: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    universityOnly: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    allowedUniversity: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
    }
  });

  Event.associate = function(models) {
    // An event belongs to a group
    Event.belongsTo(models.Group, {
      as: 'group',
      foreignKey: 'groupId'
    });
    
    // An event belongs to a creator
    Event.belongsTo(models.User, {
      as: 'creator',
      foreignKey: 'creatorId'
    });
    
    // An event has many attendees
    Event.belongsToMany(models.User, {
      through: 'EventAttendees',
      as: 'attendees',
      foreignKey: 'eventId'
    });
    
    // An event has many users who favorited it
    Event.belongsToMany(models.User, {
      through: 'EventFavorites',
      as: 'favoritedBy',
      foreignKey: 'eventId'
    });
  };

  return Event;
}; 