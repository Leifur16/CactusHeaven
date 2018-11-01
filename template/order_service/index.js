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

const newOrder = item => {
    const order = {};
    order.customerEmail = item.email;
    var arr = item.items;
    order.totalPrice = 0;
    for(var i = 0; i < arr.length; i++) {
        order.totalPrice += multiply(arr[i].quantity, arr[i].unitPrice);
    }
    order.orderDate = new Date();

    Order.create({
        customerEmail : item.email,
        totalPrice: order.totalPrice,
        orderDate: order.orderDate
    })

    return order;

};

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
        
        console.log(theOrder);
        //channel.publish(order, createOrder, new Buffer(JSON.stringify(dataJson)));
        
        /*const arrItem = [];
        arrItem.push(dataJson)
        
        const whatWeReturn = {item: arrItem};

        channel.publish(order, createOrder, new Buffer(JSON.stringify(whatWeReturn)));*/
        
    }/*, {noAck: true}*/);
    
})().catch(e => console.error(e));