const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
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
    university: {
      type: DataTypes.STRING,
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
    title: {
      type: DataTypes.STRING,
      allowNull: true
    },
    heritage: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: []
    },
    languages: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: []
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    mutualConnections: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true
    },
    linkedinUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    privacy: {
      type: DataTypes.ENUM('public', 'group', 'connections'),
      defaultValue: 'public'
    },
    eventsAttended: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
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
    // Users can join many groups
    User.belongsToMany(models.Group, {
      through: 'UserGroups',
      as: 'groups',
      foreignKey: 'userId'
    });

    // Users can connect with other users
    User.belongsToMany(User, {
      through: 'UserConnections',
      as: 'connections',
      foreignKey: 'userId',
      otherKey: 'connectionId'
    });

    // Users can attend many events
    User.belongsToMany(models.Event, {
      through: 'UserEvents',
      as: 'events',
      foreignKey: 'userId'
    });

    // Users can favorite events
    User.belongsToMany(models.Event, {
      through: 'UserFavorites',
      as: 'favoriteEvents',
      foreignKey: 'userId'
    });
    
    // Users can have activity preferences
    User.hasMany(models.ActivityPreference, {
      foreignKey: 'userId',
      as: 'activityPreferences'
    });
  };

  return User;
}; 