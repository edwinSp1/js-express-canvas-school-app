
var $container = $('#forum-posts-container')
var user = $('#user').html()
function search(arr, target) {
    for(var x of arr) {
        if(x == target) return true
    }
    return false;
}

function displayPosts(posts) {
    try {
        for(var post of posts) {
            var id = post._id
            var solidHeart = `<i class="fa-solid fa-heart FA-icon heart-icon like-post" id-value=${id}></i>`
            var emptyHeart = `<i class="fa-regular fa-heart FA-icon heart-icon like-post" id-value=${id}></i>`
            var heart = post.likedBy.includes(user) ? solidHeart : emptyHeart
            console.log(post.likedBy)
            $('<div>').html(`
                <h1 class='post-user'>${post.user}</h1>
                <h1 class='post-title'><a href='/forums/posts/${id}'>${post.title}</a></h1>
                <p class='post-content'>${post.content}</h1>
                <p class='post-likes'>${heart}<span class='like-num'>${post.likedBy.length}</span></p>
            `).addClass('forum-post').appendTo($container)
        }
        var likeButtons = document.querySelectorAll('.like-post') 
        function likePost(event) {
            var button = event.target || event.srcElement
            
            var classList = button.classList
            var isLiked = search(classList, 'fa-solid')
            var id = button.getAttribute('id-value')
            console.log(isLiked)
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
        for(var likeButton of likeButtons) {
            likeButton.addEventListener('click', likePost)
        }
    } catch(e) {
        console.log(e)
        $container.html('error fetching posts. Retrying in 20 seconds.')
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