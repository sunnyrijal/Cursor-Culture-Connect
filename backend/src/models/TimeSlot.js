module.exports = (sequelize, DataTypes) => {
  const TimeSlot = sequelize.define('TimeSlot', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    startTime: {
      type: DataTypes.STRING, // HH:MM format
      allowNull: false
    },
    endTime: {
      type: DataTypes.STRING, // HH:MM format
      allowNull: false
    }
  });

  TimeSlot.associate = function(models) {
    // TimeSlot belongs to an Availability
    TimeSlot.belongsTo(models.Availability, {
      foreignKey: 'availabilityId',
      as: 'availability'
    });
  };

  return TimeSlot;
}; 