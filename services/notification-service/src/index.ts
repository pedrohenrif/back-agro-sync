import 'dotenv/config';
import amqplib from 'amqplib';

const EXCHANGE = 'agrosync.events';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

interface LowStockPayload {
  organizationId: number;
  supplyId: number;
  supplyName: string;
  currentQuantity: number;
  minStock: number;
}

interface CropCyclePayload {
  organizationId: number;
  gardenId: number;
  planName: string;
  startDate: string;
  expectedHarvestDate: string;
}

interface HarvestPayload {
  organizationId: number;
  gardenId: number;
  yieldKg: number;
  harvestDate: string;
}

interface GardenCreatedPayload {
  organizationId: number;
  gardenId: number;
  gardenName: string;
  crop: string;
}

async function start(): Promise<void> {
  const connect = async () => {
    try {
      const conn = await amqplib.connect(RABBITMQ_URL);
      const ch = await conn.createChannel();
      await ch.assertExchange(EXCHANGE, 'topic', { durable: true });
      ch.prefetch(1);

      const subscribe = async (routingKey: string, queueName: string, handler: (p: any) => void) => {
        const q = await ch.assertQueue(queueName, { durable: true });
        await ch.bindQueue(q.queue, EXCHANGE, routingKey);
        ch.consume(q.queue, (msg) => {
          if (!msg) return;
          try {
            handler(JSON.parse(msg.content.toString()));
            ch.ack(msg);
          } catch (e) {
            console.error(`[notification] Erro ao processar ${routingKey}:`, e);
            ch.nack(msg, false, false);
          }
        });
      };

      // ── supply.low_stock ────────────────────────────────────
      await subscribe('supply.low_stock', 'notification.supply.low_stock', (p: LowStockPayload) => {
        console.warn(
          `🔴 [ALERTA] Estoque Baixo — Org #${p.organizationId}\n` +
          `   Insumo: "${p.supplyName}" (ID: ${p.supplyId})\n` +
          `   Quantidade atual: ${p.currentQuantity} | Mínimo: ${p.minStock}`,
        );
        // Extensão futura: envio de e-mail via SendGrid, push notification, etc.
      });

      // ── crop_cycle.started ──────────────────────────────────
      await subscribe('crop_cycle.started', 'notification.crop_cycle.started', (p: CropCyclePayload) => {
        console.info(
          `🌱 [INFO] Ciclo de Cultivo Iniciado — Org #${p.organizationId}\n` +
          `   Plano: "${p.planName}" | Canteiro #${p.gardenId}\n` +
          `   Início: ${new Date(p.startDate).toLocaleDateString('pt-BR')} | Colheita prevista: ${new Date(p.expectedHarvestDate).toLocaleDateString('pt-BR')}`,
        );
      });

      // ── harvest.recorded ────────────────────────────────────
      await subscribe('harvest.recorded', 'notification.harvest.recorded', (p: HarvestPayload) => {
        console.info(
          `🌾 [INFO] Colheita Registrada — Org #${p.organizationId}\n` +
          `   Canteiro #${p.gardenId} | Produção: ${p.yieldKg} kg | Data: ${new Date(p.harvestDate).toLocaleDateString('pt-BR')}`,
        );
      });

      // ── garden.created ──────────────────────────────────────
      await subscribe('garden.created', 'notification.garden.created', (p: GardenCreatedPayload) => {
        console.info(
          `🏡 [INFO] Novo Canteiro Criado — Org #${p.organizationId}\n` +
          `   Canteiro: "${p.gardenName}" (ID: ${p.gardenId}) | Cultura: ${p.crop}`,
        );
      });

      conn.on('close', () => {
        console.warn('[notification-service] Conexão RabbitMQ encerrada. Reconectando em 5s...');
        setTimeout(connect, 5000);
      });

      console.log('[notification-service] Consumidores ativos. Aguardando eventos...');
    } catch (err) {
      console.error('[notification-service] Falha ao conectar no RabbitMQ. Tentando novamente em 5s...', err);
      setTimeout(connect, 5000);
    }
  };

  await connect();
}

start();
