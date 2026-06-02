import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

console.log('Browser: Setting up MSW worker with handlers:', handlers);

// This configures a Service Worker for mocking API requests in the browser.
export const worker = setupWorker(...handlers);

// Start the worker when the module is imported
worker.start().then(() => {
  console.log('Browser: MSW worker started successfully');
}).catch((error) => {
  console.error('Browser: Failed to start MSW worker:', error);
});