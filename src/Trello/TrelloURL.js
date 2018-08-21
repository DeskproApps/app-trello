
export const parseCardURL = function (url)
{
  const cardRegex = /^https:\/\/trello\.com\/c\/([^\/]+).*$/i;
  const matches = url.match(cardRegex);
  if (matches) {
    const [, shortLink ] = matches;
    return { shortLink };
  }

  return null;
};