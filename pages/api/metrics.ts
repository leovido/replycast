import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Simple metrics endpoint for Prometheus
 * This provides basic metrics about the application
 */

interface Metric {
  name: string;
  type: 'counter' | 'gauge' | 'histogram';
  help: string;
  value: number | string;
}

// In-memory storage for metrics (in production, consider using a proper metrics library)
const metrics: Record<string, any> = {
  http_requests_total: 0,
  http_request_duration_seconds: [],
  process_uptime_seconds: 0,
};

// Track application start time
const startTime = Date.now();

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Update uptime
  metrics.process_uptime_seconds = (Date.now() - startTime) / 1000;

  // Format metrics in Prometheus format
  const output: string[] = [];

  // Uptime
  output.push('# HELP process_uptime_seconds Application uptime in seconds');
  output.push('# TYPE process_uptime_seconds gauge');
  output.push(`process_uptime_seconds ${metrics.process_uptime_seconds}`);
  output.push('');

  // HTTP requests total
  output.push('# HELP http_requests_total Total number of HTTP requests');
  output.push('# TYPE http_requests_total counter');
  output.push(`http_requests_total{method="GET",route="/api/metrics",status="200"} ${metrics.http_requests_total}`);
  output.push('');

  // Node.js memory usage
  const memUsage = process.memoryUsage();
  output.push('# HELP nodejs_memory_heap_used_bytes Memory heap used in bytes');
  output.push('# TYPE nodejs_memory_heap_used_bytes gauge');
  output.push(`nodejs_memory_heap_used_bytes ${memUsage.heapUsed}`);
  output.push('');

  output.push('# HELP nodejs_memory_heap_total_bytes Total memory heap in bytes');
  output.push('# TYPE nodejs_memory_heap_total_bytes gauge');
  output.push(`nodejs_memory_heap_total_bytes ${memUsage.heapTotal}`);
  output.push('');

  output.push('# HELP nodejs_memory_external_bytes External memory in bytes');
  output.push('# TYPE nodejs_memory_external_bytes gauge');
  output.push(`nodejs_memory_external_bytes ${memUsage.external}`);
  output.push('');

  // Increment request counter
  metrics.http_requests_total++;

  res.setHeader('Content-Type', 'text/plain; version=0.0.4');
  res.status(200).send(output.join('\n'));
}
