
var user = document.getElementById('user').innerHTML
var specialRole = $('#specialRole').html().split(',')
console.log(specialRole)
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
        var id = comment._id
        var solidHeart = `<i class="fa-solid fa-heart FA-icon heart-icon like-post" id-value=${id}></i>`
        var emptyHeart = `<i class="fa-regular fa-heart FA-icon heart-icon like-post" id-value=${id}></i>`
        var heart = comment.likedBy.includes(user) ? solidHeart : emptyHeart
        
        
        var postFix = ''
        if(comment.specialRole) {
            var role = comment.specialRole
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
        
        
        comment.user += postFix
    
        var deleteButton = ''
        var specialRole = $('#specialRole').html().split(',')
        if(specialRole == 'Creator' || specialRole == 'Admin' || specialRole.includes('Admin') || specialRole.includes('Creator')) {
            deleteButton += `<a href='/forums/comment/${comment._id}/delete?postID=${id}'><i class="fa-solid fa-x FA-icon" style='color:red'></i></a>`
        }
        
        $('<div>').html(`
            <h1>${comment.user}${deleteButton}</h1>
            <p>${comment.content}</p>
            <p> ${heart} <span class='post-likes'>${comment.likedBy.length}</span>
        `).addClass('comment').appendTo($commentContainer)
    }
    for(var x of document.querySelectorAll('.like-post')) {
        x.addEventListener('click', likePost)
    }
})