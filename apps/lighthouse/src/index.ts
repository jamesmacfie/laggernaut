import { launch } from 'chrome-launcher';
import { processPageMetricsQueue } from './queues/page-metrics';

let isProcessing = false;

async function init() {
  console.log('Starting lighthouse service...');
  
  try {
    // Test if Chrome is available
    console.log('Testing Chrome availability...');
    const chrome = await launch({ chromeFlags: ['--headless'] });
    await chrome.kill();
    
    console.log('Chrome is available, starting queue processing...');
    
    // Start polling every 5 seconds for the queue
    setInterval(async () => {
      if (!isProcessing) {
        isProcessing = true;
        try {
          await processPageMetricsQueue();
        } finally {
          isProcessing = false;
        }
      } else {
        console.log('Still processing previous lighthouse task, skipping...');
      }
    }, 5000);
    
    // Initial poll
    console.log('Running initial queue check...');
    isProcessing = true;
    try {
      await processPageMetricsQueue();
    } finally {
      isProcessing = false;
    }
  } catch (error) {
    console.error('Failed to initialize lighthouse service:', error);
    console.error('Please ensure Chrome is installed on your system');
    process.exit(1);
  }
}

console.log('Initializing lighthouse service...');
init();
