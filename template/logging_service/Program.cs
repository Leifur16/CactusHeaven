﻿/*using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System;
using System.Text;

namespace loggingService
{
    class Program
    {
        public static void Main()
        {
            var factory = new ConnectionFactory() { HostName = "localhost" };
            using(var connection = factory.CreateConnection())
            using(var channel = connection.CreateModel())
            {
                channel.QueueDeclare(queue: "hello",
                                    durable: false,
                                    exclusive: false,
                                    autoDelete: false,
                                    arguments: null);

                var consumer = new Event4ingBasicConsumer(channel);
                consumer.Received += (model, ea) =>
                {
                    var body = ea.Body;
                    var message = Encoding.UTF8.GetString(body);
                    Console.WriteLine(" [x] Received {0}", message);
                };
                channel.BasicConsume(queue: "logging_queue",
                                    autoAck: true,
                                    consumer: consumer);

                // Create a string array with the lines of text
               string[] lines = { "First line", "Second line", "Third line" };

                // Set a variable to the My Documents path.
                string mydocpath =
                    Environment.GetFolderPath();

                // Write the string array to a new file named "WriteLines.txt".
                using (StreamWriter outputFile = new StreamWriter(Path.Combine(mydocpath,"WriteLines.txt"))) {
                    foreach (string line in lines)
                        outputFile.WriteLine(line);
                }
                Console.ReadLine();
            }
        }
    }
}
*/