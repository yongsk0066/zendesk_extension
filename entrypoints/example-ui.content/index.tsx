// entrypoints/example-ui.content/index.tsx
import ReactDOM from 'react-dom/client';
import App from '../popup/App';
import '../popup/style.css';

export default defineContentScript({
  matches: ['<all_urls>'],
  cssInjectionMode: 'ui',
  // runAt: 'document_end',

  async main(ctx) {
    console.log('Content script running', ctx);
    const ui = await createShadowRootUi(ctx, {
      name: 'example-ui',
      position: 'inline',
      anchor: 'div.home-campaign-hero',
      onMount: (container) => {
        // Create a root on the UI container and render a component
        const root = ReactDOM.createRoot(container);
        root.render(<App />);
        return root;
      },
      onRemove: (root) => {
        // Unmount the root when the UI is removed
        root.unmount();
      },
    });

    // Call mount to add the UI to the DOM
    ui.mount();
  },
});
