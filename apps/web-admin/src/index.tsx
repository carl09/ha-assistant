import { StrictMode } from 'react';
// eslint-disable-next-line import/no-unresolved
import { createRoot } from 'react-dom/client';
import { App } from './App';

// This much be referanced after all components so that the css order is correct
import './index.scss';

const container = document.getElementById('root') as HTMLElement;
if (container) {
  const root = createRoot(container); // createRoot(container!) if you use TypeScript
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
