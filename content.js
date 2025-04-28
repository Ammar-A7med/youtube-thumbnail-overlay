let currentVideoId = null;

async function fetchThumbnailUrl(videoId) {
    const resolutions = ['maxresdefault', 'hqdefault', 'sddefault'];
    for (const res of resolutions) {
        const url = `https://img.youtube.com/vi/${videoId}/${res}.jpg`;
        try {
            const response = await fetch(url, { method: 'HEAD' });
            if (response.ok) return url;
        } catch {
            // Ignore errors and try the next resolution
        }
    }
    return null;
}

function waitForElement(selector) {
    return new Promise((resolve) => {
        const checkElement = () => {
            const element = document.querySelector(selector);
            if (element) resolve(element);
            else setTimeout(checkElement, 100);
        };
        checkElement();
    });
}

async function updateThumbnail() {
    const videoId = new URL(window.location.href).searchParams.get('v');

    // Remove the thumbnail if not on a video page
    if (!videoId) {
        const img = document.getElementById('custom-thumbnail');
        if (img) img.remove();
        currentVideoId = null;
        return;
    }

    if (videoId === currentVideoId) return;

    currentVideoId = videoId;
    const thumbnailUrl = await fetchThumbnailUrl(videoId);
    if (!thumbnailUrl) return;

    let img = document.getElementById('custom-thumbnail') || document.createElement('img');
    img.id = 'custom-thumbnail';
    img.src = thumbnailUrl;
    img.style.cssText = 'width: 100%; border-radius: 10px; margin-bottom: 10px;';

    const sidebar = await waitForElement('#secondary');
    if (!document.getElementById('custom-thumbnail')) sidebar.prepend(img);
}

function observePageChanges() {
    new MutationObserver(updateThumbnail).observe(document.body, { childList: true, subtree: true });
}

function initializeScript() {
    observePageChanges();
    updateThumbnail();
}

window.addEventListener('yt-navigate-finish', updateThumbnail);
initializeScript();