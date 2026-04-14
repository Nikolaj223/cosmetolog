(function () {
  const STORAGE_KEY = "beauty-lab-demo-v1";
  const memory = { state: null };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function storageAvailable() {
    try {
      const key = "__beauty_lab_test__";
      window.localStorage.setItem(key, "1");
      window.localStorage.removeItem(key);
      return true;
    } catch (error) {
      return false;
    }
  }

  function deepMerge(target, source) {
    if (Array.isArray(target) || Array.isArray(source)) {
      return clone(source || target || []);
    }

    const result = { ...(target || {}) };
    Object.keys(source || {}).forEach(function (key) {
      const sourceValue = source[key];
      const targetValue = result[key];

      if (
        sourceValue &&
        typeof sourceValue === "object" &&
        !Array.isArray(sourceValue) &&
        targetValue &&
        typeof targetValue === "object" &&
        !Array.isArray(targetValue)
      ) {
        result[key] = deepMerge(targetValue, sourceValue);
      } else {
        result[key] = clone(sourceValue);
      }
    });

    return result;
  }

  function saveRaw(state) {
    if (storageAvailable()) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } else {
      memory.state = clone(state);
    }
    return state;
  }

  function loadRaw() {
    if (storageAvailable()) {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return null;
      }
      try {
        return JSON.parse(raw);
      } catch (error) {
        return null;
      }
    }

    return memory.state ? clone(memory.state) : null;
  }

  function getState() {
    const seed = window.BeautyLabSeed.createDefaultData();
    const raw = loadRaw();
    if (!raw) {
      return saveRaw(seed);
    }
    return deepMerge(seed, raw);
  }

  function saveState(state) {
    return saveRaw(clone(state));
  }

  function updateState(mutator) {
    const next = getState();
    mutator(next);
    saveState(next);
    return next;
  }

  function resetState() {
    const fresh = window.BeautyLabSeed.createDefaultData();
    saveState(fresh);
    return fresh;
  }

  function upsert(collectionName, item) {
    return updateState(function (state) {
      const collection = state[collectionName] || [];
      const index = collection.findIndex(function (entry) {
        return entry.id === item.id;
      });

      if (index >= 0) {
        collection[index] = item;
      } else {
        collection.unshift(item);
      }

      state[collectionName] = collection;
    });
  }

  function remove(collectionName, id) {
    return updateState(function (state) {
      state[collectionName] = (state[collectionName] || []).filter(function (entry) {
        return entry.id !== id;
      });
    });
  }

  window.BeautyLabStore = {
    STORAGE_KEY,
    getState,
    saveState,
    updateState,
    upsert,
    remove,
    resetState,
  };
})();
