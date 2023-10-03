var $container = $('#forum-posts-container')
function displayPosts(posts) {
    $container.html('')
    console.log(posts)
    for(var post of posts) {
        $('<div>').html(`
            <p class='post-user'>${post.user}</p>
            <h1 class='post-title'>${post.title}</h1>
            <h1 class='post-content'>${post.content}</h1>
            <p class='post-likes'>${post.likes}</p>
        `).addClass('forumPost').appendTo($container)
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