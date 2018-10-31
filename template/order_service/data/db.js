const orderSchema = require('./schema/order');
const orderItemSchema = require('./schema/orderItem');
const mongoose = require('mongoose');

const connection = mongoose.createConnection('mongodb://abc123:abc123@ds237363.mlab.com:37363/cactus_heaven', {
    useNewUrlParser: true
});

module.exports = {
    Order: connection.model('Order', orderSchema),
    OrderItem: connection.model('OrderItem', orderItemSchema)
};
