import amqplib from 'amqplib';
import { EXCHANGE } from './events.js';

let connection: amqplib.ChannelModel | null = null;
let channel: amqplib.Channel | null = null;

async function getChannel(): Promise<amqplib.Channel> {
  if (channel) return channel;

  const url = process.env.RABBITMQ_URL || 'amqp://agrosync:rabbit_secret@localhost:5672';

  connection = await amqplib.connect(url);
  channel = await connection.createChannel();

  await channel.assertExchange(EXCHANGE, 'topic', { durable: true });

  connection.on('close', () => {
    console.warn('[RabbitMQ] Conexão encerrada. Reconectando em 5s...');
    connection = null;
    channel = null;
    setTimeout(getChannel, 5000);
  });

  connection.on('error', (err) => {
    console.error('[RabbitMQ] Erro na conexão:', err.message);
  });

  return channel;
}

export async function publishEvent(routingKey: string, payload: unknown): Promise<void> {
  const ch = await getChannel();
  const content = Buffer.from(JSON.stringify(payload));
  ch.publish(EXCHANGE, routingKey, content, { persistent: true, contentType: 'application/json' });
  console.log(`[RabbitMQ] Publicado: ${routingKey}`);
}

export async function subscribeToEvent(
  routingKey: string,
  queueName: string,
  handler: (payload: unknown) => Promise<void>,
): Promise<void> {
  const ch = await getChannel();

  const q = await ch.assertQueue(queueName, { durable: true });
  await ch.bindQueue(q.queue, EXCHANGE, routingKey);

  ch.consume(q.queue, async (msg) => {
    if (!msg) return;
    try {
      const payload = JSON.parse(msg.content.toString());
      await handler(payload);
      ch.ack(msg);
    } catch (err) {
      console.error(`[RabbitMQ] Erro ao processar ${routingKey}:`, err);
      ch.nack(msg, false, false); // descarta sem re-enfileirar em caso de erro
    }
  });

  console.log(`[RabbitMQ] Inscrito em: ${routingKey} → fila: ${queueName}`);
}

export async function connectRabbitMQ(): Promise<void> {
  await getChannel();
  console.log('[RabbitMQ] Conectado com sucesso.');
}
