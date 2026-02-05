import * as SecureStore from "expo-secure-store";

const RECENT_SEARCHES_KEY = "recent_searches";
const MAX_RECENT_SEARCHES = 10;

/**
 * Retrieves the list of recent search terms from secure storage.
 * @returns A promise that resolves to an array of recent search strings.
 */
export const getRecentSearches = async (): Promise<string[]> => {
  try {
    const storedSearches = await SecureStore.getItemAsync(RECENT_SEARCHES_KEY);
    return storedSearches ? JSON.parse(storedSearches) : [];
  } catch (error) {
    console.error("Failed to get recent searches", error);
    return [];
  }
};

/**
 * Adds a new search term to the list of recent searches.
 * Ensures the list is unique and does not exceed the maximum size.
 * @param term The search term to add.
 * @returns A promise that resolves when the operation is complete.
 */
export const addRecentSearch = async (term: string): Promise<void> => {
  if (!term || term.trim().length === 0) {
    return;
  }

  const trimmedTerm = term.trim();
  try {
    const currentSearches = await getRecentSearches();

    const filteredSearches = currentSearches.filter(
      (search) => search.toLowerCase() !== trimmedTerm.toLowerCase(),
    );

    const newSearches = [trimmedTerm, ...filteredSearches];

    const limitedSearches = newSearches.slice(0, MAX_RECENT_SEARCHES);

    await SecureStore.setItemAsync(
      RECENT_SEARCHES_KEY,
      JSON.stringify(limitedSearches),
    );
  } catch (error) {
    console.error("Failed to add recent search", error);
  }
};

/**
 * Clears all recent search terms from storage.
 * @returns A promise that resolves when the operation is complete.
 */
export const clearRecentSearches = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(RECENT_SEARCHES_KEY);
  } catch (error) {
    console.error("Failed to clear recent searches", error);
  }
};
