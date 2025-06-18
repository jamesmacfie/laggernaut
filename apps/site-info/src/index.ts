import { processSiteInfoQueue } from './queues/site-info';
import { processPageLinksQueue } from './queues/page-links';

// Start polling every 5 seconds for both queues
setInterval(processSiteInfoQueue, 5000);
setInterval(processPageLinksQueue, 5000);

// Initial poll
processSiteInfoQueue();
processPageLinksQueue();
