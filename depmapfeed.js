const rssURL = "http://localhost:3000/?url=" + encodeURIComponent('https://www.cancer.gov/publishedcontent/rss/syndication/rss/ncinewsreleases.rss');

function fetchRSSFeed(url) {
    return fetch(url)
      .then(response => response.text())
      .then(xml => {
        const parser = new DOMParser(); // XML and HTML parser interface
        const xmlDoc = parser.parseFromString(xml, 'text/xml');
        const items = xmlDoc.querySelectorAll('item');
        return Array.from(items).map(item => ({
          title: item.querySelector('title').textContent,
          link: item.querySelector('link').textContent,
          pubDate: new Date(item.querySelector('pubDate').textContent),
          description: item.querySelector('description').textContent,
          enclosure: item.querySelector('enclosure').getAttribute('url')
        }));
      });
  }
  
  function displayFeed(feed) {
    const newsFeed = document.getElementById('rss-feed');
    feed.forEach(item => {
      const newsItem = document.createElement('div');
      newsItem.classList.add('news');
  
      const titleElement = document.createElement('a');
      titleElement.textContent = item.title;
      titleElement.href = item.link;
      titleElement.target = '_blank';
      titleElement.rel = 'noopener noreferrer';
      titleElement.classList.add('title');
      newsItem.appendChild(titleElement);
  
      const descriptionElement = document.createElement('p');
      descriptionElement.textContent = item.description;
      descriptionElement.classList.add('description');
      newsItem.appendChild(descriptionElement);
  
      const pubDateElement = document.createElement('p');
      pubDateElement.textContent = `Published on: ${item.pubDate.toDateString()}`;
      pubDateElement.classList.add('pub-date');
      newsItem.appendChild(pubDateElement);
  
      const imageElement = document.createElement('img');
      imageElement.src = item.enclosure;
      imageElement.classList.add('thumbnail');
      newsItem.appendChild(imageElement);
  
      newsFeed.appendChild(newsItem);
    });
  }
  
  fetchRSSFeed(rssURL)
    .then(feed => displayFeed(feed))
    .catch(error => console.error('Error fetching RSS feed:', error));
  