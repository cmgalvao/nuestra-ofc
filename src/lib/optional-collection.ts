import { getCollection, type CollectionEntry } from 'astro:content';
import { OPTIONAL_DIRS, hasContentFiles, optionalDir } from './optional-glob';

/**
 * getCollection() para coleções que podem estar vazias: devolve [] sem chamar
 * getCollection (que avisaria "does not exist or is empty" no build).
 */
export async function optionalCollection<C extends keyof typeof OPTIONAL_DIRS>(name: C): Promise<CollectionEntry<C>[]> {
  if (!hasContentFiles(optionalDir(name))) return [];
  return (await getCollection(name)) as CollectionEntry<C>[];
}
