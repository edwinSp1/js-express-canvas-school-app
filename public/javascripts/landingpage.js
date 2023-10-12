const delay = 0.05;


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
var hasEle = (arr, ele) => {
    for(var x of arr) if(x == ele) return true
    return false
}
function textType() {
    var reveals = document.querySelectorAll(".underscore-flash");
    for (var i = 0; i < reveals.length; i++) {
        if(hasEle(reveals[i].classList, 'active')) continue
        var windowHeight = window.innerHeight;
        var elementTop = reveals[i].getBoundingClientRect().top;
        var elementVisible = 150;
        if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add("active");
            addTo(reveals[i], reveals[i].getAttribute('data-value'))
        } 
    }
}
window.addEventListener('scroll', textType)

function reveal () {
    var reveals = document.querySelectorAll('.reveal')
    for(var ele of reveals) {
        var windowHeight = window.innerHeight;
        var elementTop = ele.getBoundingClientRect().top;
        var elementVisible = 150;
        if (elementTop < windowHeight - elementVisible) {
            ele.classList.add('active')
            ele.classList.remove('reveal')
        }
    }
}
window.addEventListener('scroll', reveal)
//call it incase it's already in view
textType()
reveal() 
var showModalButtons = document.querySelectorAll('.show-modal')
var modals = document.querySelectorAll('.modal')

for(var button of showModalButtons) {
    button.addEventListener('click', function(e) {
        var ele = e.target ?? e.srcElement //IE
        var newId = ele.getAttribute('id').slice(5) //show-thing -> thing
        document.getElementById(newId).showModal()
    })
}
var hideModalButtons = document.querySelectorAll('.close-modal')

for(var button of hideModalButtons) {
    button.addEventListener('click', function(e) {
        var ele = e.target ?? e.srcElement //IE
        var newId = ele.getAttribute('id').slice(6) //close-thing -> thing
        document.getElementById(newId).close()
    })
}