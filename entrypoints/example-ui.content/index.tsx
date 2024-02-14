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
      anchor: 'body',
      onMount: (container) => {
        const root = ReactDOM.createRoot(container);
        setTimeout(() => {
          const modalsBackdrop = document.querySelectorAll('[data-garden-id="modals.backdrop"]');
          modalsBackdrop.forEach((modal) => {
            modal.parentNode.removeChild(modal);
          });
          console.log('모든 [data-garden-id="modals.backdrop"] 요소가 제거되었습니다.');

          // class="modal-backdrop"을 가진 모든 요소 제거
          const modalBackdrops = document.querySelectorAll('.modal-backdrop');
          modalBackdrops.forEach((backdrop) => {
            backdrop.parentNode.removeChild(backdrop);
          });
          console.log('모든 .modal-backdrop 요소가 제거되었습니다.');

          // #wrapper에서 .blur 클래스 제거
          const wrapper = document.getElementById('wrapper');
          if (wrapper.classList.contains('blur')) {
            wrapper.classList.remove('blur');
            console.log('#wrapper에서 .blur 클래스가 제거되었습니다.');
          } else {
            console.log('#wrapper에 .blur 클래스가 존재하지 않습니다.');
          }
        }, 2000);

        console.log('UI container mounted');

        initializeEmailFinder();

        root.render(<Link />);
        console.log('React 컴포넌트 렌더링');
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

function searchAndAttachEmailLink(rootNode) {
  const emailRegex = /[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/g;
  rootNode.querySelectorAll('*').forEach((node) => {
    if (
      node.nodeType === Node.TEXT_NODE &&
      emailRegex.test(node.nodeValue) &&
      !node.parentNode.hasAttribute('data-email-linked')
    ) {
      const email = node.nodeValue.match(emailRegex)[0];
      attachEmailLink(node, email);
    } else if (
      node.nodeType === Node.ELEMENT_NODE &&
      emailRegex.test(node.innerHTML) &&
      !node.hasAttribute('data-email-linked')
    ) {
      const emailMatches = node.innerHTML.match(emailRegex);
      if (emailMatches) {
        emailMatches.forEach((email) => {
          if (!node.hasAttribute('data-email-linked')) {
            attachEmailLink(node, email);
          }
        });
      }
    }
  });
}

function attachEmailLink(node, email) {
  // 이메일 링크가 이미 존재하는지 확인
  if (
    node.nextSibling &&
    node.nextSibling.nodeType === Node.ELEMENT_NODE &&
    node.nextSibling.getAttribute('href')?.includes(email)
  ) {
    console.log('이미 링크가 존재함:', email);
    return; // 이미 링크가 존재하면 추가하지 않음
  }

  const emailLink = document.createElement('a');
  emailLink.href = `https://test/users?email=${encodeURIComponent(email)}`;
  emailLink.innerText = '관리 페이지로 이동';
  emailLink.style.marginLeft = '10px';
  emailLink.target = '_blank';
  emailLink.setAttribute('data-email-linked', ''); // 처리됨을 표시

  if (node.nextSibling) {
    node.parentNode.insertBefore(emailLink, node.nextSibling);
  } else {
    node.parentNode.appendChild(emailLink);
  }

  if (node.nodeType === Node.TEXT_NODE) {
    node.parentNode.setAttribute('data-email-linked', ''); // 부모 노드에 처리됨을 표시
  } else {
    node.setAttribute('data-email-linked', ''); // ELEMENT_NODE에 직접 처리됨을 표시
  }
}
