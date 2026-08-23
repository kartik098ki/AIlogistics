import { SalesLog, Vendor } from '../types';

export function exportSalesCSV(salesLogs: SalesLog[], vendor: Vendor): void {
  const headers = ['Log ID', 'Date', 'Order ID', 'Items Sold', 'Revenue (INR)', 'Pack Time (sec)', 'On Time Delivery'];
  const rows = salesLogs.map(log => {
    const itemsStr = log.itemsSold.map(i => `${i.qty}x ${i.name}`).join('; ');
    return [
      log.id,
      log.date,
      log.orderId,
      `"${itemsStr}"`,
      log.revenue,
      log.packTimeSeconds,
      log.wasOnTime ? 'YES' : 'NO'
    ];
  });

  const csvContent = 'data:text/csv;charset=utf-8,' 
    + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `sales_summary_${vendor.stationCode}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
