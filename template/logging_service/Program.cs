using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System;
using System.IO;
using System.Text;

namespace loggingService
{
    class Program
    {
        public static void Main()
        {
            var exchangeName = "order_exchange";
            //var queueName = "logging_queue";
            var inputRoutingKey = "create_order";

            var factory = new ConnectionFactory() { HostName = "localhost" };
            using (var connection = factory.CreateConnection())
            using (var channel = connection.CreateModel())
            {
                // Declare exchange
                channel.ExchangeDeclare(exchange: "direct_logs", type: "direct");

                // Declare Queu
                var queueName = channel.QueueDeclare().QueueName;

                // Bind queue to exchange with a routing key
                channel.QueueBind(queue: queueName,
                                  exchange: exchangeName,
                                  routingKey: inputRoutingKey);

                var consumer = new EventingBasicConsumer(channel);

                consumer.Received += (model, ea) =>
                {
                    var body = ea.Body;
                    var message = Encoding.UTF8.GetString(body);
                    Console.WriteLine(message);

                    string path = Directory.GetCurrentDirectory();
                    using (StreamWriter outputFile = new StreamWriter(Path.Combine(path, "log.txt"), true))
                    {
                        //outputFile.Write("Log: ");
                        //outputFile.Write(message);
                        outputFile.WriteLine("Log: " + message);
                    }
                };
                channel.BasicConsume(queue: queueName,
                                    autoAck: true,
                                    consumer: consumer);

                Console.WriteLine(" Press [enter] to exit.");
                Console.ReadLine();
            }
        }
    }
}
