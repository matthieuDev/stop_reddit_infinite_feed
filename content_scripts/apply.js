

(() => {
    /**
     * Check and set a global guard variable.
     * If this content script is injected into the same page again,
     * it will do nothing next time.
     */
    if (window.hasRun) {
      return;
    }
    window.hasRun = true;
    
    const filterHtml = maxPost => {
        const listPost = document.querySelector('shreddit-feed').childNodes;

        let i = 0;
        for (let post of listPost) {
            if (!(post.matches && post.matches('article, .virtualized-placeholder') && post.offsetHeight  > 1)) continue;
            if (i >= maxPost) {
                post.remove();
            }
            i++;
        }
    };


    /**
     * Listen for messages from the background script.
    */
    browser.runtime.onMessage.addListener((message) => {
        if (message.command === "filterHtml") {
            filterHtml(message.maxPost);
        } 
    });
  
})();