import is from '@sindresorhus/is';
import { load } from 'js-yaml';
import { HelmDatasource } from '../../datasource/helm';
import { logger } from '../../logger';
import { SkipReason } from '../../types';
import { regEx } from '../../util/regex';
import type { ExtractConfig, PackageDependency, PackageFile } from '../types';
import type { HelmsmanDocument } from './types';

const chartRegex = regEx('^(?<registryRef>[^/]*)/(?<lookupName>[^/]*)$');

function createDep(key: string, doc: HelmsmanDocument): PackageDependency {
  const dep: PackageDependency = {
    depName: key,
    datasource: HelmDatasource.id,
  };
  const anApp = doc.apps[key];
  if (!anApp) {
    return null;
  }

  if (!anApp.version) {
    dep.skipReason = SkipReason.NoVersion;
    return dep;
  }
  dep.currentValue = anApp.version;

  const regexResult = chartRegex.exec(anApp.chart);
  if (!regexResult) {
    dep.skipReason = SkipReason.InvalidUrl;
    return dep;
  }

  if (!is.nonEmptyString(regexResult.groups.lookupName)) {
    dep.skipReason = SkipReason.InvalidName;
    return dep;
  }
  dep.lookupName = regexResult.groups.lookupName;

  const registryUrl = doc.helmRepos[regexResult.groups.registryRef];
  if (!is.nonEmptyString(registryUrl)) {
    dep.skipReason = SkipReason.NoRepository;
    return dep;
  }
  dep.registryUrls = [registryUrl];

  return dep;
}

export function extractPackageFile(
  content: string,
  fileName: string,
  config: ExtractConfig
): PackageFile | null {
  try {
    // TODO: fix me (#9610)
    const doc = load(content, {
      json: true,
    }) as HelmsmanDocument;
    if (!(doc?.helmRepos && doc.apps)) {
      logger.debug({ fileName }, 'Missing helmRepos and/or apps keys');
      return null;
    }

    const deps = Object.keys(doc.apps)
      .map((key) => createDep(key, doc))
      .filter(Boolean); // filter null values

    if (deps.length === 0) {
      return null;
    }

    return { deps };
  } catch (err) /* istanbul ignore next */ {
    if (err.stack?.startsWith('YAMLException:')) {
      logger.debug({ err }, 'YAML exception extracting');
    } else {
      logger.warn({ err }, 'Error extracting');
    }
    return null;
  }
}
