
const maxPostLength = 200;
var $container = $('#forum-posts-container')
var user = $('#user').html()
var specialRole = $('#specialRole').html()
var pageNum = $('#page').html()
function search(arr, target) {
    for(var x of arr) {
        if(x == target) return true
    }
    return false;
}

function displayPosts(posts) {
    try {
        if(posts.length == 0) {
            $container.html('No posts on this page :(')
            return
        }
        for(var post of posts) {
            var id = post._id
            var solidHeart = `<i class="fa-solid fa-heart FA-icon heart-icon like-post" id-value=${id}></i>`
            var emptyHeart = `<i class="fa-regular fa-heart FA-icon heart-icon like-post" id-value=${id}></i>`
            var heart = post.likedBy.includes(user) ? solidHeart : emptyHeart
            if(post.content.length > maxPostLength) {
                post.content = post.content.slice(0, maxPostLength)
                post.content += "..."
            }
            
            var postFix = ''
            if(post.specialRole) {
                var role = post.specialRole
                if(role == 'Creator' || role.includes('Creator'))
                    postFix += `<i class="fa-solid fa-code special-icon" modal=${dashCase("Creator")} style='color:blue'></i>`
                if(role == 'Beta Tester' || role.includes('Beta Tester'))
                    postFix += `<i class="fa-solid fa-screwdriver-wrench special-icon" modal=${dashCase('Beta Tester')} style='color:green' ></i>`
                if(role == 'Admin' || role.includes('Admin'))
                    postFix += `<i class="fa-solid fa-star special-icon" modal=${dashCase('Admin')} style='color:red'></i>`
                if(role =='Teacher' || role.includes('Teacher'))
                    postFix += `<i class="fa-solid fa-chalkboard-user special-icon" modal=${dashCase('Teacher')} style='color:yellow'></i>`
                if(role =='Bro' || role.includes('Bro'))
                    postFix += `<i class="fa-solid fa-trash special-icon" modal=${dashCase('Bro')} style='color:yellow'></i>`
            
                function dashCase (str) {  
                    return str.toLowerCase().split(' ').join('-')
                }
            } 
            
            
            post.user += postFix
            //if its creator or admin
            var deleteButton = ''
            if(specialRole == 'Creator' || specialRole == 'Admin' || specialRole.includes('Admin') || specialRole.includes('Creator')) {
                deleteButton += `<a href='/forums/posts/${post._id}/delete'><i class="fa-solid fa-x FA-icon" style='color:red'></i></a>`
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
        $container.html('error fetching posts. Try reloading.')
    }
}

  


const searchButton = document.getElementById('search')
var searchBar = document.getElementById('search-query')
var cancelButton = document.getElementById('cancel')
async function check() {
    var query = searchBar.value

    $container.html('Searching...')
    await $.get(`/api/forumPosts/${pageNum}/?query=${query}`, async function(data, status) {
        
        $container.html('')
        if(data.length == 0) $container.html('no results found.')
        else displayPosts(data)
    })
} 
//call it when the page first loads
check()

cancelButton.addEventListener('click', function () {
    window.location = '/forums/1'
})

searchButton.addEventListener('click', check)

$('#next').on('click', function(e) {
    window.location =`/forums/${Number(pageNum)+1}?query=${searchBar.value}`
})
var prevButton = $('#prev')
//the prevButton does not necissarily exist
if(prevButton) {
    prevButton.on('click', function() {
        window.location =`/forums/${pageNum-1}?query=${searchBar.value}`
    })
}
