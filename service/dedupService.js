const MAX_CACHE_SIZE=50;

const cache=new Map();

function get(key){
    if(!cache.has(key)) return null;

    const value=cache.get(key);

    cache.delete(key);

    cache.set(key,value);

    return value;
}

function set(key, value) {
  if (cache.has(key)) cache.delete(key);

  cache.set(key, value);

  if (cache.size > MAX_CACHE_SIZE) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }
}

module.exports = { get, set };