import './css/styles.css';
import axios from "axios";
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import OnlyScroll from 'only-scrollbar';

const API_KEY = '35141798-2bab5ffbeb44d8443663db9b1';
const BASE_URL = 'https://pixabay.com/api/';

const searchForm = document.querySelector('.search-form');
const imagesContainer = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
let searchQuery = '';
let currentPage = 1;

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

searchForm.addEventListener('submit', onSearch);
loadMoreBtn.addEventListener('click', onLoadMore);
window.addEventListener('scroll', infinitScroll);

function onSearch(e) {
  resetPage();
  e.preventDefault();
  clearImagesContainer();
  searchQuery = e.currentTarget.elements.searchQuery.value.trim();
  const url = `${BASE_URL}?key=${API_KEY}&q=${searchQuery}&type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${currentPage}`;

  if (searchQuery === '') {
    loadMoreBtn.classList.add('is-hidden');
    Notify.failure("Please enter something.");
  } else {
    fetchImages(url).then(hits => {
      if (hits.total === 0) {
        loadMoreBtn.classList.add('is-hidden');
        Notify.failure("Sorry!!!!!!!, there are no images matching your search query. Please try again.");
        } else {
          Notify.success(`Hooray! We found ${hits.totalHits} images.`);
        }
    })
  }  
};

function onLoadMore() {
  const url = `${BASE_URL}?key=${API_KEY}&q=${searchQuery}&type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${currentPage}`;
  fetchImages(url);
};

async function fetchImages(url){
  try {
    const response = await axios(url);
    const hits = await response.data;
    imagesContainer.insertAdjacentHTML('beforeend', renderImageCards(hits));
    currentPage += 1;
    // loadMoreBtn.classList.remove('is-hidden');
    lightbox.refresh();
    return hits;
  } catch {
    // loadMoreBtn.classList.add('is-hidden');
    Notify.failure("We're sorry, but you've reached the end of search results.");
  }
}

function renderImageCards(hits) {
  return hits.hits.map(({webformatURL, largeImageURL, tags, likes, views, comments,  downloads}) => {
    return `
    <a class="card-link" href='${largeImageURL}'><div class="photo-card"><img class="card-img" src="${webformatURL}" alt="${tags}" loading="lazy"/>
    <div class="info">
      <p class="info-item">
        <b>Likes:${likes}</b>
      </p>
      <p class="info-item">
        <b>Views:${views}</b>
      </p>
      <p class="info-item">
        <b>Comments:${comments}</b>
      </p>
      <p class="info-item">
        <b>Downloads:${downloads}</b>
      </p>
    </div>
    </div>
    </a>`
  }).join('');
};

function clearImagesContainer() {
  imagesContainer.innerHTML = '';
};

function resetPage(){
  currentPage = 1;
}


// const scroll = new OnlyScroll(document.querySelector('.scroll-container'));

// const scroll = new OnlyScroll('#scroll-container-id', {
//     damping: 0.8,
//     eventContainer: window
// });


// const scroll = new OnlyScroll({ height: cardHeight } = document
//   .querySelector(".gallery")
//   .firstElementChild.getBoundingClientRect());

// window.scrollBy({
//   top: cardHeight * 2,
//   behavior: "smooth",
// });


function infinitScroll() {
    while(true) {
      let windowRelativeBottom = document.documentElement.getBoundingClientRect().bottom;
    if (windowRelativeBottom > document.documentElement.clientHeight + 100) break;
      return onLoadMore();
    }
  }
