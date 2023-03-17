import getAnnotatedDOM from './getAnnotatedDOM';

const GET_DOM_MESSAGE = 'get-annotated-dom';

const methods = {
  'get-annotated-dom': getAnnotatedDOM,
  'click-element': (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.click();
    }
  },
} as const;

type Methods = typeof methods;
type MethodName = keyof Methods;
type Payload<T extends MethodName> = Parameters<Methods[T]>[0];
type MethodRT<T extends MethodName> = ReturnType<Methods[T]>;

// Call this function from the content script
export const callRPC = async <T extends MethodName>(
  type: keyof typeof methods,
  payload?: Payload<T>
): Promise<MethodRT<T>> => {
  let queryOptions = { active: true, currentWindow: true };
  let activeTab = (await chrome.tabs.query(queryOptions))[0];

  // If the active tab is a chrome-extension:// page, then we need to get some random other tab for testing
  if (activeTab.url?.startsWith('chrome')) {
    queryOptions = { active: false, currentWindow: true };
    activeTab = (await chrome.tabs.query(queryOptions))[0];
  }

  if (!activeTab?.id) throw new Error('No active tab found');
  console.log('sending message', type, payload, activeTab.id);
  const response: MethodRT<T> = await chrome.tabs.sendMessage(activeTab.id, {
    type,
    payload,
  });
  console.log('got response', response);

  return response;
};

const isKnownMethodName = (type: string): type is MethodName => {
  return type in methods;
};

// This function should run in the content script
export const watchForRPCRequests = () => {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const type = message.type;
    if (isKnownMethodName(type)) {
      // console.log('got message', type, message.payload);
      const resp = methods[type](message.payload);
      if (resp instanceof Promise) {
        resp.then(sendResponse);
        return true;
      } else {
        sendResponse(resp);
      }
    }
  });
};
