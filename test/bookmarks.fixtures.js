function makeBookmarksArray() {
    return [
        {
            id: 1,
            title: 'boogle',
            url: 'www.boogle.com',
            description: 'Search Engine of bois',
            rating: 4,
        },
        {
            id: 2,
            title: 'Dinkful',
            url: 'www.Dinkful.com',
            description: 'Dool Site',
            rating: 3,
        },
        {
            id: 3,
            title: 'myPlace',
            url: 'www.myplace.com',
            description: 'myPlace is your place',
            rating: 1,
        },
        {
            id: 4,
            title: 'maybeCool',
            url: 'www.maybecool.com',
            description: 'killer times',
            rating: 3,
        },
    ];
  }
  
  module.exports = {
    makeBookmarksArray,
  };