import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Health check endpoint for Docker healthcheck and monitoring
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  };

  res.status(200).json(health);
}
