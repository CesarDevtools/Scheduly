const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const scheduleSchema = new Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    startTime: {
        type: String,
        required: true,
    },
    endTime: {
        type: String,
        required: true,
    },
    position: {
        type: String,
        required: true,
        enum: ['Abrir kiosko', 'Cafetera', 'Medio', 'Mercancia', 'Caja', 'Día libre']
    },
    nota: {
        type: String,
        required: false,
        maxlength: 200,
        default: ''
    },
}, {
    timestamps: true  // Añade createdAt y updatedAt automáticamente
});

// Índice para mejorar búsquedas por empleado y fecha
scheduleSchema.index({ employee: 1, date: 1 });

module.exports = mongoose.model('schedules', scheduleSchema);