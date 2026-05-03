function toggleAvatar() {
    const gatoImg = document.getElementById('popcat-image')
    if (!gatoImg) return;
    
    if (gatoImg.src == avatarState.close_mouth) {
        gatoImg.src = avatarState.open_mouth;
    } else {
        gatoImg.src = avatarState.close_mouth;
    }
}

async function onClick() {
    toggleAvatar();
}

function toggleContextMenu() {
    const contextMenu = document.getElementById('popcat-context-menu');
    if (!contextMenu) return;
    if (contextMenu.style.display === 'block') {
        setContextOpenState(false);
        contextMenu.style.display = 'none';
    } else {
        setContextOpenState(true);
        contextMenu.style.display = 'block';
    }
}
