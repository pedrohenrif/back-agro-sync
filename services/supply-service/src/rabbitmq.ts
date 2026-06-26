import amqplib from 'amqplib';

const EXCHANGE = 'agrosync.events';
let channel: amqplib.Channel | null = null;

async function getChannel(): Promise<amqplib.Channel> {
  if (channel) return channel;
  const conn = await amqplib.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
  channel = await conn.createChannel();
  await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
  conn.on('close', () => { channel = null; });
  return channel;
}

export async function publishEvent(routingKey: string, payload: unknown): Promise<void> {
  try {
    const ch = await getChannel();
    ch.publish(EXCHANGE, routingKey, Buffer.from(JSON.stringify(payload)), {
      persistent: true, contentType: 'application/json',
    });
    console.log(`[supply-service][RabbitMQ] Publicado: ${routingKey}`);
  } catch (err) {
    console.error(`[supply-service][RabbitMQ] Falha ao publicar ${routingKey}:`, err);
  }
}
