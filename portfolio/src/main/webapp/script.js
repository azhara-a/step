// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * On mobile, collapses the navbar if a link is clicked
 */
$('.navbar-nav>li>a').on('click', function () {
  $('.navbar-collapse').collapse('hide');
});

/* On the first load of the page, 
 * if localStorage has an item "limit" with value N, 
 * then fetches N comments 
 * else fetches the default number set by the page
 */
function getComments() {
  const isLimitSet = null !== localStorage.getItem("limit");
  const limit = isLimitSet ? localStorage.getItem("limit") :
            document.getElementById('commentLimit').value;
  localStorage.setItem("limit", limit);
  document.getElementById("commentLimit").value = limit;
  fetchComments(limit);
}

/* On change of selected limit of displayed comments, 
 * sets the new limit in localStorage and fetches the selected number of comments
 */
function getCommentsWithLimit() {
    const limit = document.getElementById('commentLimit').value;
    localStorage.setItem("limit", limit);
    fetchComments(limit);
}

/* Given a limit N, fetches N comments from /data and puts results into comments-text element */
async function fetchComments(limit) {
  document.getElementById('comments-spinner').style.display = "block";
  const commentsElement = document.getElementById('comments-text');
  const response = await fetch('/data?limit=' + limit);
  const comments = await response.json();
  commentsElement.innerHTML = '';
  for (let i = 0; i < comments.length; i++) {
    commentsElement.appendChild(createParagraph(comments[i]));
  }
  document.getElementById('comments-spinner').style.display = "none";
}

/* Creates <p> element in format: "name: comment" */
function createParagraph(text) {
  const paragraph = document.createElement('p');
  paragraph.setAttribute('class', 'card-text');
  paragraph.innerText = text.name + ": " + text.comment;
  return paragraph;
}

/* Deletes all comments by calling /delete-data and refreshes comments-text element */
async function deleteComments() {
  const request = new Request('/delete-data', {method: 'POST'});
  const response = await fetch(request);
  const isDeleted = await response.json();

  if (isDeleted) {
    getComments();
  } else {
    $('#adminModal').modal('toggle');
  }
}

/* If user is logged in: display comment submission form,
 * If user is logged in and admin: display comment submission form 
 *                                   and delete all comments button,
 * else: display login link
 */
async function displayCommentsForm() {
  document.getElementById('comments-form-spinner').style.display = "block";
  const response = await fetch("/login-status");
  const loginInfo = await response.json();
  const loginForm = document.getElementById('login-form');
  const commentForm = document.getElementById('comment-form');

  if (loginInfo.isLoggedIn) {
      loginForm.style.display = "none";
      commentForm.style.display = "block";
      document.getElementById('logout-url').href = loginInfo.url;
  } else {
      loginForm.style.display = "block";
      commentForm.style.display = "none";
      document.getElementById('login-url').href = loginInfo.url; 
  }

  document.getElementById("inputNickname").value = loginInfo.nickname;
  document.getElementById("inputName").value = loginInfo.nickname;

  document.getElementById('comments-form-spinner').style.display = "none";

  document.getElementById('comments-spinner').style.display = "block";
  const deleteCommentsButton = document.getElementById('delete-comments-btn');
  if (loginInfo.isAdmin) {
      deleteCommentsButton.style.display = "block";
  } else {
      deleteCommentsButton.style.display = "none";
  }
  document.getElementById('comments-spinner').style.display = "none";
}

function bodyOnLoad() {
  getComments();
  displayCommentsForm();
}
