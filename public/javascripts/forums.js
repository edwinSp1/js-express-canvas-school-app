var $container = $('#forum-posts-container')
function displayPosts(posts) {
    $container.html('')
    
    for(var post of posts) {
        var solidHeart = '<i class="fa-solid fa-heart FA-icon heart-icon"></i>'
        var emptyHeart = `<i class="fa-regular fa-heart FA-icon heart-icon like-post" id-value=${post._id}></i>`
        var heart = post.likedBy.includes(post.user) ? solidHeart : emptyHeart
        $('<div>').html(`
            <p class='post-user'>${post.user}</p>
            <h1 class='post-title'>${post.title}</h1>
            <h1 class='post-content'>${post.content}</h1>
            <p class='post-likes'>${heart}${post.likes}</p>
        `).addClass('forum-post').appendTo($container)
    }
    var likeButtons = document.querySelectorAll('.like-post') 
    console.log(likeButtons)
    function likePost(event) {
        var button = event.target
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
        displayPosts(data)
    })
}, 20000)