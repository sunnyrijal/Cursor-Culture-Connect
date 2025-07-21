module.exports = (sequelize, DataTypes) => {
  const Availability = sequelize.define('Availability', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    day: {
      type: DataTypes.ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'),
      allowNull: false
    }
  });

  Availability.associate = function(models) {
    // Availability belongs to an ActivityPreference
    Availability.belongsTo(models.ActivityPreference, {
      foreignKey: 'preferenceId',
      as: 'preference'
    });
    
    // Availability has many time slots
    Availability.hasMany(models.TimeSlot, {
      foreignKey: 'availabilityId',
      as: 'timeSlots'
    });
  };

  return Availability;
}; 