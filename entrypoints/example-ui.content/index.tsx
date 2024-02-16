// entrypoints/example-ui.content/index.tsx
import ReactDOM from 'react-dom/client';
import Link from './Link';

export default defineContentScript({
  matches: ['https://jyso.zendesk.com/*'],
  cssInjectionMode: 'ui',
  // runAt: 'document_end',

  async main(ctx) {
    console.log('Content script running', ctx);
    const ui = await createShadowRootUi(ctx, {
      name: 'example-ui',
      position: 'inline',
      anchor: 'body',
      onMount: (container) => {
        const root = ReactDOM.createRoot(container);
        root.render(<Link />);
        console.log('React 컴포넌트 렌더링');

        // UI 관련 작업을 초기화합니다.
        initializeUiModifications();

        console.log('UI container mounted');

        initializeEmailFinder();

        return root;
      },
      onRemove: (root) => {
        // Unmount the root when the UI is removed
        root.unmount();
      },
    });
    //   // aria-label="컨텍스트 패널"

    // Call mount to add the UI to the DOM
    ui.mount();
  },
});

function initializeUiModifications() {
  setInterval(() => {
    removeElementsBySelectors(['[data-garden-id="modals.backdrop"]', '.modal-backdrop']);
    toggleClassById('wrapper', 'blur', false);
  }, 3000);
}

function removeElementsBySelectors(selectors: string[]) {
  selectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => el.parentNode?.removeChild(el));
  });
  console.log('지정된 요소들이 제거되었습니다:', selectors.join(', '));
}

function toggleClassById(elementId: string, className: string, add: boolean) {
  const element = document.getElementById(elementId);
  if (element) {
    add ? element.classList.add(className) : element.classList.remove(className);
    console.log(`${elementId}에서 ${className} 클래스가 ${add ? '추가' : '제거'}되었습니다.`);
  } else {
    console.log(`${elementId} 요소를 찾을 수 없습니다.`);
  }
}

function initializeEmailFinder() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          searchAndAttachEmailLink(node);
        }
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // 초기 페이지 로드 시 이메일 검색 및 처리
  searchAndAttachEmailLink(document.body);
}
function searchAndAttachEmailLink(rootNode: HTMLElement) {
  const emailRegex = /[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/g;
  // 모든 텍스트 노드를 순회합니다.
  const nodes = rootNode.querySelectorAll('*');
  for (const node of nodes) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const textContent = node.textContent || '';
      const emails = textContent.match(emailRegex) || [];
      if (emails.length > 0 && !node.hasAttribute('data-email-linked')) {
        // 이메일 텍스트를 포함하는 가장 바깥쪽 노드에만 링크를 추가합니다.
        attachEmailLink(node, emails[0]); // 첫 번째 이메일에 대해서만 처리합니다.
        break; // 첫 번째 이메일을 처리한 후 루프를 종료합니다.
      }
    }
  }
}

function attachEmailLink(node: Node, email: string) {
  // 이메일 주소를 하이퍼링크로 변환하는 정규식을 사용합니다.
  const emailRegex = new RegExp(`(${email})`, 'g');
  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as HTMLElement;
    const newHtml = element.innerHTML.replace(
      emailRegex,
      `<a href="https://local-foa-v2.rememberapp.co.kr:10002/users?email=${encodeURIComponent(
        'sm9@rmbr.in'
      )}" target="_blank" data-email-linked>sm9@rmbr.in</a>`
    );
    element.innerHTML = newHtml;
    element.setAttribute('data-email-linked', ''); // 이메일 링크가 추가된 요소를 표시합니다.
  }
}
