const mongoose = require('mongoose');
const { Admin } = require('../config/roles_list');
const Schema = mongoose.Schema;

const employeeSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        required: true,
    },
    color: {
        type: String,
        default: '#3b82f6',
    },
    password: {
        type: String,
        required: true,
    },
    refreshToken: {
        type: String,
    },
    roles: {
        Employee: {
            type: Number,
            default: 3001
        },
        Admin: Number
    },
}, {
    timestamps: true  // Añade createdAt y updatedAt automáticamente
});

module.exports = mongoose.model('User', employeeSchema, 'users');