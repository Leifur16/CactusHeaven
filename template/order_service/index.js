const amqp = require('amqplib/callback_api');
const fs = require('fs');
const {Order, OrderItem} = require('./data/db');

const messageBrokerInfo = {
    exchanges: {
        order: 'order_exchange'
    },
    queue: {
        orderQueue: 'order_queue'
    },
    routingKeys: {
        createOrder: 'create_order'
    }
}


const createMessageBrokerConnection = () => new Promise((resolve, reject) => {
    amqp.connect('amqp://localhost', (err, conn) => {
        if (err) { reject(err); }
        resolve(conn);
    });
});

const createChannel = connection => new Promise((resolve, reject) => {
    connection.createChannel((err, channel) => {
        if (err) { reject(err); }
        resolve(channel);
    });
});

const configureMessageBroker = channel => {
    const { order } = messageBrokerInfo.exchanges;
    const { orderQueue } = messageBrokerInfo.queue;
    const { createOrder } = messageBrokerInfo.routingKeys;

    channel.assertExchange(order, 'direct', { durable: true });
    channel.assertQueue(orderQueue, { durable: true });
    channel.bindQueue(orderQueue, order, createOrder);
};

const multiply = (a, b) => a * b;

const newOrder = async item => {
    const order = {};
    order.customerEmail = item.email;
    var arr = item.items;
    order.totalPrice = 0;
    for(var i = 0; i < arr.length; i++) {
        order.totalPrice += multiply(arr[i].quantity, arr[i].unitPrice);
    }
    order.orderDate = new Date();

    try {
        const newOrder = await Order.create({
            customerEmail : item.email,
            totalPrice: order.totalPrice,
            orderDate: order.orderDate
        })

        newOrderItem(item, newOrder);
    } catch (error) {
        throw(error);
    }
    

    

};

const newOrderItem = async(order, orderDetails) => {
   
    try {
        const item = {};

        var arr = order.items;
        item.rowPrice = 0;
        for(var i = 0; i < arr.length; i++) {
            item.rowPrice += await multiply(arr[i].quantity, arr[i].unitPrice);
        }
        for(var i = 0; i < arr.length; i++) {
            const newOrder = await OrderItem.create({
                description : arr[i].description,
                quantity: arr[i].quantity,
                unitPrice: arr[i].unitPrice,
                rowPrice: item.rowPrice,
                orderId: orderDetails._id
        
            })
        }
        return newOrder;
        
    } catch (error) {
        throw(error);
    }  
}



(async () => {
    const messageBrokerConnection = await createMessageBrokerConnection();
    const channel = await createChannel(messageBrokerConnection);

    configureMessageBroker(channel);

    const { order } = messageBrokerInfo.exchanges;
    const { orderQueue } = messageBrokerInfo.queue;
    const { createOrder } = messageBrokerInfo.routingKeys;

    channel.consume(orderQueue, data => {
        const dataJson = JSON.parse(data.content.toString());
        
        const theOrder = newOrder(dataJson);
        
    });
    
})().catch(e => console.error(e));