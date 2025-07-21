module.exports = (sequelize, DataTypes) => {
  const SocialMedia = sequelize.define('SocialMedia', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    platform: {
      type: DataTypes.STRING,
      allowNull: false
    },
    link: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });

  SocialMedia.associate = function(models) {
    // SocialMedia belongs to a group
    SocialMedia.belongsTo(models.Group, {
      foreignKey: 'groupId',
      as: 'group'
    });
  };

  return SocialMedia;
}; 