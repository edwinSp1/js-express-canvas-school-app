var user = document.getElementById('user').innerHTML
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

var $commentContainer = $('#comment-container')
$.get('/api/posts/' + id + '/getComments', function(data, status) {
    for(var comment of data) {
        var className = 'fa-regular'
        if(comment.likedBy.includes(user)) className = 'fa-solid'
        var color = 'white'
        var postFix = ''
        if(comment.specialRole) {
            switch (comment.specialRole) {
                case 'Creator':
                    color = 'blue';
                    postFix = `<i class="fa-solid fa-code special-icon" 
                    modal=${dashCase(comment.specialRole)}></i>`
                    break;
                case 'Beta Tester':
                    color = 'green';
                    postFix = `<i class="fa-solid fa-screwdriver-wrench special-icon" 
                    modal=${dashCase(comment.specialRole)} ></i>`
                    break;
                case 'Admin':
                    color = 'red';
                    postFix = `<i class="fa-solid fa-star special-icon" 
                    modal=${dashCase(comment.specialRole)} ></i>`
                    break;
                case 'Teacher':
                    color = 'yellow';
                    postFix = `<i class="fa-solid fa-chalkboard-user special-icon" 
                    modal=${dashCase(comment.specialRole)} ></i>`
                    break;
            }
            
            function dashCase (str) {
                return str.toLowerCase().split(' ').join('-')
            }
            comment.user += `<span 
                            style='color:${color};'>
                            ${postFix}</span>`
        }
        $('<div>').html(`
            <h1>${comment.user}</h1>
            <p>${comment.content}</p>
            <p> <i class="fa-heart FA-icon heart-icon like-post ${className}" id-value = "${comment._id}"></i> <span class='post-likes'>${comment.likedBy.length}</span>
        `).addClass('comment').appendTo($commentContainer)
    }
    for(var x of document.querySelectorAll('.like-post')) {
        x.addEventListener('click', likePost)
    }
})