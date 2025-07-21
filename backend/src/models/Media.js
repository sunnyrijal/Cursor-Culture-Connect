module.exports = (sequelize, DataTypes) => {
  const Media = sequelize.define('Media', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'image'
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    caption: {
      type: DataTypes.STRING,
      allowNull: true
    }
  });

  Media.associate = function(models) {
    // Media belongs to a group
    Media.belongsTo(models.Group, {
      foreignKey: 'groupId',
      as: 'group'
    });
  };

  return Media;
}; 