import { fetchData } from '../fetch-data';

const defaultFetchData = () => Promise.resolve();

function fetchDataForRoute({ routes, params }, dispatch) {
  const urls = routes[routes.length - 1].urls;

  return urls ? fetchData(urls, params, dispatch) : defaultFetchData();
}

export default fetchDataForRoute;