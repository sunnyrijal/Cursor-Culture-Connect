const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 30]
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 100]
      }
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    university: {
      type: DataTypes.STRING,
      allowNull: true
    },
    culturalBackground: {
      type: DataTypes.STRING,
      allowNull: true
    },
    interests: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: []
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    major: {
      type: DataTypes.STRING,
      allowNull: true
    },
    year: {
      type: DataTypes.STRING,
      allowNull: true
    },
    languages: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: []
    },
    heritage: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: []
    },
  }, {
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  // Instance method to check password
  User.prototype.validPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  };

  // Associate with other models
  User.associate = function(models) {
    // User belongs to many groups (as a member)
    User.belongsToMany(models.Group, {
      through: 'GroupMembers',
      as: 'memberGroups',
      foreignKey: 'userId'
    });
    
    // User belongs to many groups (as an admin)
    User.belongsToMany(models.Group, {
      through: 'GroupAdmins',
      as: 'adminGroups',
      foreignKey: 'userId'
    });
    
    // User has many groups (as president/creator)
    User.hasMany(models.Group, {
      as: 'createdGroups',
      foreignKey: 'presidentId'
    });
    
    // User belongs to many events (as an attendee)
    User.belongsToMany(models.Event, {
      through: 'EventAttendees',
      as: 'attendingEvents',
      foreignKey: 'userId'
    });
    
    // User belongs to many events (as a favorite)
    User.belongsToMany(models.Event, {
      through: 'EventFavorites',
      as: 'favoritedEvents',
      foreignKey: 'userId'
    });
    
    // User has many events (as creator)
    User.hasMany(models.Event, {
      as: 'createdEvents',
      foreignKey: 'creatorId'
    });
    
    // User has many group requests (as requester)
    User.hasMany(models.GroupRequest, {
      as: 'groupRequests',
      foreignKey: 'requesterId'
    });
    
    // User has many group requests (as responder)
    User.hasMany(models.GroupRequest, {
      as: 'respondedGroupRequests',
      foreignKey: 'responderId'
    });
    
    // User has many event requests (as creator)
    User.hasMany(models.EventRequest, {
      as: 'eventRequests',
      foreignKey: 'creatorId'
    });
    
    // User has many event requests (as responder)
    User.hasMany(models.EventRequest, {
      as: 'respondedEventRequests',
      foreignKey: 'responderId'
    });
    
    // User has many received notifications
    User.hasMany(models.Notification, {
      as: 'receivedNotifications',
      foreignKey: 'recipientId'
    });
    
    // User has many sent notifications
    User.hasMany(models.Notification, {
      as: 'sentNotifications',
      foreignKey: 'senderId'
    });
  };

  return User;
}; 