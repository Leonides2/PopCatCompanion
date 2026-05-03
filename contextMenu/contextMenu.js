var contextOpenState = false;

function getContextOpenState() {

    if (localStorage.getItem('contextOpenState') === 'true') {
        return true;
    } else {
        return false;
    }
}

function setContextOpenState(state) {

    localStorage.setItem('contextOpenState', state);
    contextOpenState = state;
}
