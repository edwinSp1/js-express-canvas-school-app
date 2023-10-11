const delay = 0.3;
const wait = (sec) => {
    return new Promise(resolve => setTimeout(resolve, sec*1000));
};
async function deleteTo (ele, numDelete) {
    for(var i = numDelete; i >= 0; i--) {
        await wait(delay)
        ele.innerHTML = ele.innerHTML.slice(0, ele.innerHTML.length-1)
    }
}
async function addTo(ele, str) {
    for(var c of str) {
        await wait(delay)
        ele.innerHTML += c
    }
}
var statement = document.getElementById('statement')
async function morphText () {
    while(true) {
        await wait(1)
        await deleteTo(statement, 8)
        await addTo(statement, ' Teachers.')
        await wait(1)
        await deleteTo(statement, 9)
        await addTo(statement, ' Students.')
        await wait(1)
        await deleteTo(statement, 9)
        await addTo(statement, ' Schools.')
    }
}
morphText()