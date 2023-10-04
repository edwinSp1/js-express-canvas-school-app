var $container = $('#forum-posts-container')
var user = $('#user').html()
console.log(user)
function displayPosts(posts) {
    
    for(var post of posts) {
        var id = post._id
        var solidHeart = '<i class="fa-solid fa-heart FA-icon heart-icon"></i>'
        var emptyHeart = `<i class="fa-regular fa-heart FA-icon heart-icon like-post" id-value=${id}></i>`
        var heart = post.likedBy.includes(user) ? solidHeart : emptyHeart
        $('<div>').html(`
            <h1 class='post-user'>${post.user}</h1>
            <h1 class='post-title'><a href='/forums/posts/${id}'>${post.title}</a></h1>
            <p class='post-content'>${post.content}</h1>
            <p class='post-likes'>${heart}<span class='like-num'>${post.likes}</span></p>
        `).addClass('forum-post').appendTo($container)
    }
    var likeButtons = document.querySelectorAll('.like-post') 
    function likePost(event) {
        var button = event.target || event.srcElement
        button.parentNode.children[1].textContent++
        var id = button.getAttribute('id-value')
        $.get('/api/likeForumPost/' + id)
        button.outerHTML = solidHeart
        button.removeEventListener('click', likePost)
    }
    for(var likeButton of likeButtons) {
        likeButton.addEventListener('click', likePost)
    }
}

$.get('/api/forumPosts', function(data, status) {
    if(status != 'success') {
        $container.html('error fetching posts.')
        return;
    }
    displayPosts(data)
})

/*
Update posts every 20 seconds
*/
window.setInterval(function() {
    $.get('/api/forumPosts', function(data, status) {
        if(status != 'success') {
            $container.html('error fetching posts.')
            return;
        }
        $container.html('')
        displayPosts(data)
    })
}, 20000)