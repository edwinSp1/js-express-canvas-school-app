const maxPostLength = 200;
var $container = $('#forum-posts-container')
var user = $('#user').html()
var specialRole = $('#specialRole').html()
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
            if(post.content.length > maxPostLength) {
                post.content = post.content.slice(0, maxPostLength)
                post.content += "..."
            }
            
            var color = 'white'
            var postFix = ''
            if(post.specialRole) {
                switch (post.specialRole) {
                    case 'Creator':
                        color = 'blue';
                        postFix = `<i class="fa-solid fa-code special-icon" 
                        modal=${dashCase(post.specialRole)}></i>`
                        break;
                    case 'Beta Tester':
                        color = 'green';
                        postFix = `<i class="fa-solid fa-screwdriver-wrench special-icon" 
                        modal=${dashCase(post.specialRole)} ></i>`
                        break;
                    case 'Admin':
                        color = 'red';
                        postFix = `<i class="fa-solid fa-star special-icon" 
                        modal=${dashCase(post.specialRole)} ></i>`
                        break;
                    case 'Teacher':
                        color = 'yellow';
                        postFix = `<i class="fa-solid fa-chalkboard-user special-icon" 
                        modal=${dashCase(post.specialRole)} ></i>`
                        break;
                }
                
                function dashCase (str) {
                    return str.toLowerCase().split(' ').join('-')
                }
                post.user += `<span 
                                style='color:${color};'>
                                ${postFix}</span>`
            }
            //if its creator or admin
            var deleteButton = ''
            console.log(specialRole)
            if(specialRole == 'Creator' || specialRole == 'Admin') {
                deleteButton += `<a href='forums/posts/${post._id}/delete'><i class="fa-solid fa-x FA-icon" style='color:red'></i></a>`
            }
            console.log(deleteButton)
            //replace multiple spaces with one to prevent trolling
            post.content = post.content.replace(/\s+/g, ' ')
            $('<div>').html(`
                <h1 class='post-user'>${post.user}${deleteButton}</h1><p>${post.date ?? 'no date'}</p>
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
                /*
        MODALS FOR SPECIAL ROLES
        */
        var icons = document.querySelectorAll('.special-icon')
        for(var icon of icons) {
            icon.onclick = function(e) {
                ele = e.target || e.srcElement 
                var id = ele.getAttribute('modal')
                var modal = document.getElementById(id)
                modal.showModal()
                modal.firstElementChild.onclick = () => modal.close()
            }
        }
    } catch(e) {
        console.log(e)
        $container.html('error fetching posts. Retrying in 20 seconds.')
    }
}
//store it so we don't need to make more unneccessary queries
var origData;
$.get('/api/forumPosts', function(data, status) {
    if(status != 'success') {
        $container.html('error fetching posts.')
        return;
    }
    origData = data;
    displayPosts(data)
})

const searchButton = document.getElementById('search')
var searchBar = document.getElementById('search-query')
var cancelButton = document.getElementById('cancel')
cancelButton.addEventListener('click', function () {
    $container.html('')
    displayPosts(origData)
})

searchButton.addEventListener('click', check)
async function check() {
  var query = searchBar.value
  
  $container.html('Searching...')
  await $.get('/api/forumPosts/query/' + query, async function(data, status) {
    
    $container.html('')
    if(data.length == 0) $container.html('no results found.')
    else displayPosts(data)
  })
}
