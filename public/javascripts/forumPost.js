var id = document.querySelector('.like-post').getAttribute('id-value')
function search(arr, target) {
    for(var x of arr) {
        if(x == target) return true
    }
    return false;
}
function likePost(event) {
    var button = event.target || event.srcElement
    
    var classList = button.classList
    var isLiked = search(classList, 'fa-solid')
    var id = button.getAttribute('id-value')
    if(!isLiked) {
        
        button.parentNode.children[1].textContent++
        classList.remove('fa-regular')
        classList.add('fa-solid')
        
        $.get('/api/likeForumPost/'+id)
    } else {
        
        button.parentNode.children[1].textContent--
        classList.remove('fa-solid')
        classList.add('fa-regular')

        $.get('/api/unlikeForumPost/'+id)
    }
}
document.querySelector('.like-post').addEventListener('click', likePost)
$.get('/api/posts/' + id + '/getComments', function(data, status) {
    console.log(data)
})