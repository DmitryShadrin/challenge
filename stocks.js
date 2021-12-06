const fetch = require("node-fetch");

const baseUrl = 'https://jsonmock.hackerrank.com/api/stocks/search?date=';

const getMonth = (date) => date.toLocaleString("default", { month: "long" });

const printStockHistory = (stocks) => {
  stocks.forEach(({ date, open, close }) => {
    console.log(date, open, close);
  });
};

const getStockHistory = async (dateSearch, stockHistory, startDate, endDate) => {
  try {
    let pageNumber = 0;
    let json, page, totalPages;
    let url;
    do {
      pageNumber++;
      url = `${baseUrl}${dateSearch}&page=${pageNumber}`;
      const response = await fetch(url);
      json = await response.json();
      const { data } = json;
      page = json.page;
      totalPages = json.total_pages;
      if (data && data.length) {
        // filter by date range
        const filteredDataByDate = data.filter(({ date }) => {
          const stockDate = new Date(date);
          const isWithinPeriod = startDate <= stockDate && stockDate <= endDate;
          return isWithinPeriod;
        });
        // save stock info
        filteredDataByDate.forEach(({ date, open, close }) => {
          stockHistory.push({ date, open, close });
        });
      }
      // paginate if more pages are left to be retrieved
    } while (json && page && totalPages && page < totalPages);
  } catch (error) {
    console.log(error);
  }
}

const openAndClosePrices = async (firstDate, lastDate) => {
  const stockHistory = [];
  const startDate = new Date(firstDate);
  const endDate = new Date(lastDate);
  const startDateYear = startDate.getFullYear();
  const endDateYear = endDate.getFullYear();
  const startDateMonth = startDate.getMonth();
  const endDateMonth = endDate.getMonth();
  if (startDate.valueOf() === endDate.valueOf()) {
    // First and last dates are the same. Query a single date only.
    await getStockHistory(firstDate, stockHistory, startDate, endDate);
  } else if (startDateYear === endDateYear && startDateMonth === endDateMonth) {
    // First and last date are within the same year, same month. Query a single month only.
    const monthString = getMonth(startDate);
    const yearMonth = `${monthString}-${startDateYear}`;
    await getStockHistory(yearMonth, stockHistory, startDate, endDate);
  } else {
    // Query every year of the range.
    for (let year = startDateYear; year <= endDateYear; year++) {
      await getStockHistory(year, stockHistory, startDate, endDate);
    }
  }
  printStockHistory(stockHistory);
};

module.exports = {
  openAndClosePrices,
};