import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// This configures a Service Worker for mocking API requests in the browser.
export const worker = setupWorker(...handlers);