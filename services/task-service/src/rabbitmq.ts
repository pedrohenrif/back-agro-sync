import amqplib from 'amqplib';
import { prisma } from './prisma.js';

const EXCHANGE = 'agrosync.events';

export async function startConsumers(): Promise<void> {
  const url = process.env.RABBITMQ_URL || 'amqp://localhost';

  const connect = async () => {
    try {
      const conn = await amqplib.connect(url);
      const ch = await conn.createChannel();
      await ch.assertExchange(EXCHANGE, 'topic', { durable: true });

      // ── Consumidor: crop_cycle.started ───────────────────────
      const q1 = await ch.assertQueue('task-service.crop_cycle.started', { durable: true });
      await ch.bindQueue(q1.queue, EXCHANGE, 'crop_cycle.started');

      ch.consume(q1.queue, async (msg) => {
        if (!msg) return;
        try {
          const payload = JSON.parse(msg.content.toString());
          console.log('[task-service] crop_cycle.started recebido:', payload);

          // Cria tarefa de acompanhamento automática no início do ciclo
          await prisma.task.create({
            data: {
              title: `Início do ciclo: ${payload.planName}`,
              description: `Ciclo iniciado em ${new Date(payload.startDate).toLocaleDateString('pt-BR')}. Colheita prevista: ${new Date(payload.expectedHarvestDate).toLocaleDateString('pt-BR')}.`,
              priority: 'HIGH',
              status: 'PENDING',
              dueDate: new Date(payload.startDate),
              organizationId: payload.organizationId,
              gardenId: payload.gardenId,
            },
          });

          ch.ack(msg);
        } catch (err) {
          console.error('[task-service] Erro ao processar crop_cycle.started:', err);
          ch.nack(msg, false, false);
        }
      });

      conn.on('close', () => {
        console.warn('[task-service][RabbitMQ] Conexão perdida. Reconectando em 5s...');
        setTimeout(connect, 5000);
      });

      console.log('[task-service][RabbitMQ] Consumidores registrados com sucesso.');
    } catch (err) {
      console.error('[task-service][RabbitMQ] Falha na conexão. Tentando novamente em 5s...', err);
      setTimeout(connect, 5000);
    }
  };

  await connect();
}
