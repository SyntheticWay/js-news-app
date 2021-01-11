// Custom Http Module
function customHttp() {
  return {
    get(url, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.addEventListener("load", () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener("error", () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        xhr.send();
      } catch (error) {
        cb(error);
      }
    },
    post(url, body, headers, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.addEventListener("load", () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener("error", () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
        }

        xhr.send(JSON.stringify(body));
      } catch (error) {
        cb(error);
      }
    },
  };
}
// Init http module
const http = customHttp();

const newsService = (function () {
  const apiKey = "af2d52037a39449497f6655fc9a6b39c";
  // const apiUrl = "https://newsapi.org/v2";
  const apiUrl = "https://news-api-v2.herokuapp.com";

  return {
    topHeadlines(country = "de", category = "technology", cb) {
      http.get(
        `${apiUrl}/top-headlines?country=${country}&category=${category}&apiKey=${apiKey}`,
        cb
      );
    },
    everything(query, cb) {
      http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb);
    },
  };
})();

// elements
const form = document.forms["newsControls"];
const countrySelect = form.elements["country"];
const searchInput = form.elements["search"];
const categorySelecr = form.elements["category"];

form.addEventListener("submit", (e) => {
  e.preventDefault();
  loadNews();
});

//  init selects
document.addEventListener("DOMContentLoaded", function () {
  M.AutoInit();

  loadNews();
});

// load news function
function loadNews() {
  showLoader();

  const country = countrySelect.value;
  const searchText = searchInput.value;
  const category = categorySelecr.value;

  if (!searchText) {
    newsService.topHeadlines(country, category, onGetResponse);
  } else {
    newsService.everything(searchText, onGetResponse);
  }
}

// function on get response from server
function onGetResponse(err, res) {
  removeLoader();

  if (err) {
    showAlert(err, "error-msg");
    return;
  }

  if (!res.articles.length) {
    showAlert(
      "Ooops! Your keywords are so rare. Couldn't find anything... Try again."
    );
    const newsContainer = document.querySelector(".news-container .row");
    clearContainer(newsContainer);
    return;
  }

  renderNews(res.articles);
}

// function render news
function renderNews(news) {
  const newsContainer = document.querySelector(".news-container .row");
  if (newsContainer.children.length) {
    clearContainer(newsContainer);
  }
  let fragment = "";
  news.forEach((newsItem) => {
    const el = newsTemplate(newsItem);
    if (!el) {
      return;
    }
    fragment += el;
  });

  newsContainer.insertAdjacentHTML("afterbegin", fragment);
}

// function clear container
function clearContainer(container) {
  // container.innerHTML = ''; // the same as below

  let child = container.lastElementChild;
  while (child) {
    container.removeChild(child);
    child = container.lastElementChild;
  }
}

// news template function
function newsTemplate({ urlToImage, title, url, description }) {
  if (!description) {
    return null;
  }

  return `
    <div class="col s12">
    <div class="card">
      <div class="card-image">
        <img src="${urlToImage || "img/empty-img.png"}" alt="image" />
        <span class="card-title">${title || ""}</span>
      </div>
      <div class="card-content">
        <p>${description || ""}</p>
      </div>
      <div class="card-action">
        <a href="${url}">Read More</a>
      </div>
    </div>
    </div>
  `;
}

function showAlert(msg, type = "success") {
  // M - global obj in materializecss
  M.toast({ html: msg, classes: type });
}

// show loader function
function showLoader() {
  document.body.insertAdjacentHTML(
    "afterbegin",
    `<div class="progress">
      <div class="indeterminate"></div>
    </div>`
  );
}

// remove loader function
function removeLoader() {
  const loader = document.querySelector(".progress");
  if (loader) {
    loader.remove();
  }
}
