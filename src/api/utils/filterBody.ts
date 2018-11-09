interface IFilterBody {
  [key: string]: string;
}

export function filteredBody(body: IFilterBody, whitelist: string[]) {
  const items: IFilterBody = {};

  Object.keys(body).forEach(key => {
    if (whitelist.indexOf(key) >= 0) {
      items[key] = body[key];
    }
  });

  return items;
}