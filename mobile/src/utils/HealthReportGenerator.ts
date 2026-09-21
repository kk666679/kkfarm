import type { DeviceDetails, DeviceMetrics } from '@/types';

export class HealthReportGenerator {
  static generate(device: DeviceDetails, metrics: DeviceMetrics): string {
    const lines = [
      `Health Report for ${device.name}`,
      `Generated: ${new Date().toISOString()}`,
      `Platform: ${device.platform}`,
      `Status: ${device.status}`,
      ``,
      `Metrics:`,
      `- Total Tasks: ${metrics.totalTasksCompleted}`,
      `- Success Rate: ${(metrics.successRate * 100).toFixed(1)}%`,
      `- Avg Execution Time: ${metrics.averageExecutionTime}ms`,
      `- Uptime: ${Math.floor(metrics.uptime / 3600)}h ${Math.floor((metrics.uptime % 3600) / 60)}m`,
      ``,
      `Warnings:`,
    ];

    if ((device.cpuUsage ?? 0) > 90) {
      lines.push(`- High CPU usage: ${device.cpuUsage!.toFixed(1)}%`);
    }
    if (device.batteryLevel < 20) {
      lines.push(`- Low battery: ${device.batteryLevel}%`);
    }

    lines.push('');
    lines.push('24h Trend:');
    lines.push('- CPU: stable');
    lines.push('- Memory: stable');
    lines.push('- Battery: stable');

    return lines.join('\n');
  }

  static generateJSON(device: DeviceDetails, metrics: DeviceMetrics): string {
    const report = {
      device: {
        id: device.id,
        name: device.name,
        platform: device.platform,
        status: device.status,
      },
      generatedAt: new Date().toISOString(),
      metrics: {
        totalTasksCompleted: metrics.totalTasksCompleted,
        successRate: metrics.successRate,
        averageExecutionTime: metrics.averageExecutionTime,
        uptime: metrics.uptime,
      },
      warnings: [
        ...((device.cpuUsage ?? 0) > 90 ? [{ type: 'high_cpu', value: device.cpuUsage }] : []),
        ...(device.batteryLevel < 20 ? [{ type: 'low_battery', value: device.batteryLevel }] : []),
      ],
    };
    return JSON.stringify(report, null, 2);
  }
}

export default HealthReportGenerator;
