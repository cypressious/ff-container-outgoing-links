browser.webRequest.onBeforeRequest.addListener((options) => {
    return onBeforeRequest(options);
}, {urls: ["<all_urls>"], types: ["main_frame"]}, ["blocking"]);

async function onBeforeRequest(options) {
    const tab = await browser.tabs.get(options.tabId);

    if (tab.openerTabId === undefined) {
        return
    }

    const cookieStoreId = tab.cookieStoreId;

    if (!cookieStoreId || cookieStoreId === 'firefox-default') {
        return;
    }

    const targetHost = new URL(options.url).host.toLowerCase();
    const {host: originHost, protocol: originProtocol} = new URL(options.originUrl);

    if (originProtocol !== 'moz-extension:' && targetHost.toLowerCase() !== originHost.toLowerCase()) {
        await browser.tabs.remove(options.tabId);
        await browser.tabs.create({url: options.url, index: tab.index, active: tab.active});

        return {cancel: true}
    }
}