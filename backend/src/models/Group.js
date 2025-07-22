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
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    image: {
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
    meetingTime: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    meetingDate: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    meetingLocation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    meetingDays: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
    },
    chatId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  Group.associate = function(models) {
    // A group belongs to many users (members)
    Group.belongsToMany(models.User, { 
      through: 'GroupMembers',
      as: 'members',
      foreignKey: 'groupId'
    });
    
    // A group has many admins
    Group.belongsToMany(models.User, {
      through: 'GroupAdmins',
      as: 'admins',
      foreignKey: 'groupId'
    });
    
    // A group has one creator/president
    Group.belongsTo(models.User, {
      as: 'president',
      foreignKey: 'presidentId'
    });
    
    // A group has many events
    Group.hasMany(models.Event, {
      as: 'events',
      foreignKey: 'groupId'
    });
    
    // A group has many membership requests
    Group.hasMany(models.GroupRequest, {
      as: 'membershipRequests',
      foreignKey: 'groupId'
    });
  };

  return Group;
}; 