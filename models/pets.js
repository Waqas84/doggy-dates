module.exports = function(sequelize, DataTypes) {
    var Dogs = sequelize.define("Dogs", {
        dog_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        image: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isUrl: true
            }
        },
        zip_code: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                len: [1, 140]
            }
        },
        dob: {
            // type: DataTypes.DATEONLY
            type: DataTypes.INTEGER,
        },
        energy_level: {
            type: DataTypes.STRING
        },
        sex: {
            type: DataTypes.STRING
        },
        size: {
            type: DataTypes.STRING
        },

    });


    Dogs.associate = function(models) {

        Dogs.belongsTo(models.User, {
            foreignKey: {
                allowNull: false
            }
        });
    };

    return Dogs;
}