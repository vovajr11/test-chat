import './css/styles.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import debounce from 'debounce';
import countriesApi from '../src/fetchCountries';

const DEBOUNCE_DELAY = 300;

const refs = {
  input: document.getElementById('search-box'),
  ul: document.querySelector('.country-list'),
  container: document.querySelector('.country-info'),
};

refs.input.addEventListener('input', debounce(onSearch, DEBOUNCE_DELAY));

function onSearch(e) {
  e.preventDefault();

  e.target.value = e.target.value.trim();
  const countryName = e.target.value;

  if (!countryName) {
    clearContainers();
    return;
  }

  countriesApi.fetchCountries(countryName)
    .then(handleResults)
    .catch(catchError);
}

function handleResults(result) {
  if (result.status === 404) {
    handleZeroResults();
    return;
  }

  renderCountryCard(result);
}

function renderCountryCard(countries) {
  if (countries?.length === 1) {
    handleOneResult(countries);
    return;
  }

  if (countries?.length > 1 && countries?.length < 10) {
    handleRangeOfResults(countries);
    return;
  }

  if (countries?.length >= 10) {
    handleTooManyResults();
    return;
  }
}

function handleRangeOfResults(countries) {
  const markup = countries
    .map(country => {
      return `
        <li class="country-list-item">
        <img src="${country.flags.svg}" width="50" height="35" alt="">
        <h3>${country.name.official}</h3>
        </li>`;
    })
    .join('');

  refs.ul.innerHTML = markup;
  refs.container.innerHTML = '';
}

function handleTooManyResults() {
  Notify.info('Too many matches found. Please enter a more specific name.');

  clearContainers();
}

function clearContainers() {
  refs.ul.innerHTML = '';
  refs.container.innerHTML = '';
}

function handleOneResult(countries) {
  const markup = countries
    .map(country => {
      return `
        <img src="${country.flags.svg}" width="50" height="35" alt="flag">
        <h3 class="country-name">${country.name.official}</h3>
        <ul>
           <li><p class="list-item">Capital: ${country.capital}</p></li>
           <li><p class="list-item">Population: ${country.population}</p></li>
           <li><p class="list-item">Languages: ${Object.values(country.languages)}</p></li>
        </ul>`;
    })
    .join('');

  refs.container.innerHTML = markup;
  refs.ul.innerHTML = '';
}

function handleZeroResults() {
  Notify.failure('Oops, there is no country with that name');

  clearContainers();
}

function catchError(error) {
  Notify.failure(`An error occured. Error: ${error}`);

  clearContainers();
}
