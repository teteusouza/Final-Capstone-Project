"use strict";

// get user token
function getUserToken() {
  const loginData = localStorage.getItem('login-data');

  if (loginData) {
    const parsedData = JSON.parse(loginData);
    if (parsedData.token) {
      return parsedData.token;
    }
  }

  console.error('User token not found');
  return 'DEFAULT_TOKEN';
}

// create a new post
function createPost(text) {
  const token = getUserToken();
  
  // check if the text exceeds the character limit
  const characterLimit = 500;
  if (text.length > characterLimit) {
    console.error('Post exceeds the character limit');
    return;
  }

  fetch('https://microbloglite.herokuapp.com/api/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ text })
  })
  .then(response => response.json())
  .then(data => {
    console.log('New post created:', data);
    const textInput = document.getElementById('textInput');
    textInput.value = '';
    fetchPosts();
  })
  .catch(error => {
    console.error('Error creating post:', error);
  });
}

// function to delete a post
function deletePost(postId) {
  const token = getUserToken();

  fetch(`https://microbloglite.herokuapp.com/api/posts/${postId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => response.json())
  .then(data => {
    console.log('Post deleted:', data);
    fetchPosts();
  })
  .catch(error => {
    console.error('Error deleting post:', error);
  });
}

// function to fetch posts from the API
function fetchPosts() {
  const token = getUserToken();

  fetch('https://microbloglite.herokuapp.com/api/posts?limit=100000000000&offset=0', {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => response.json())
  .then(data => {
    const postsContainer = document.getElementById('posts');
    postsContainer.innerHTML = '';


        // Sorts all the posts on the garden by number of likes in descending order
        data.sort((a, b) => {
          if (a.likes.length !== b.likes.length) {
            return b.likes.length - a.likes.length; // Sort by most likes
          } else {
            return new Date(b.timestamp) - new Date(a.timestamp); // Sort by most recently posted
          }
        });


    // add post data to HTML
    if (data && data.length > 0) {
      data.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post';

        const usernameElement = document.createElement('div');
        usernameElement.className = 'username';
        usernameElement.innerHTML = post.username;

        const textElement = document.createElement('div');
        textElement.innerHTML = post.text;

        const likesElement = document.createElement('div');
        likesElement.className = 'likes';
        likesElement.innerHTML = `Likes: ${post.likes.length}`;

        // display delete button only for posts made from your token
        if (post.userToken === token) {
          const deleteButton = document.createElement('button');
          deleteButton.textContent = 'Delete';
          deleteButton.addEventListener('click', () => {
            deletePost(post.id);
          });
          postElement.appendChild(deleteButton);
        }

        postElement.appendChild(usernameElement);
        postElement.appendChild(textElement);
        postElement.appendChild(likesElement);

        postsContainer.appendChild(postElement);
      });
    } else {
      console.error('No posts found');
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });
}

fetchPosts();

// the post button
const form = document.getElementById('postForm');

form.addEventListener('submit', event => {
  event.preventDefault();

  const textInput = document.getElementById('textInput');
  const text = textInput.value.trim();

  if (text !== '') {
    createPost(text);
  }
});
