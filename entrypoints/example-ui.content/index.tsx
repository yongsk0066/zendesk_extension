// entrypoints/example-ui.content/index.tsx
import ReactDOM from 'react-dom/client';
import Link from './Link';

export default defineContentScript({
  matches: ['<all_urls>'],
  cssInjectionMode: 'ui',
  // runAt: 'document_end',

  async main(ctx) {
    console.log('Content script running', ctx);
    const ui = await createShadowRootUi(ctx, {
      name: 'example-ui',
      position: 'inline',
      anchor: 'div#user_id',
      onMount: (container) => {
        // Create a root on the UI container and render a component
        const root = ReactDOM.createRoot(container);
        root.render(<Link />);
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
