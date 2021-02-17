import { ExternalHostError } from '../types/errors/external-host-error';
import { Http, HttpError } from '../util/http';
import type {
  DatasourceApi,
  DigestConfig,
  GetReleasesConfig,
  ReleaseResult,
} from './types';

export abstract class Datasource implements DatasourceApi {
  constructor() {
    this.http = new Http(this.getId());
  }

  abstract readonly id: string;

  caching: boolean;

  defaultConfig: Record<string, unknown>;

  customRegistrySupport: boolean;

  defaultRegistryUrls: string[];

  defaultVersioning: string;

  registryStrategy: 'first' | 'hunt' | 'merge';

  getId(): string {
    return this.id;
  }

  protected http: Http;

  abstract getReleases(
    getReleasesConfig: GetReleasesConfig
  ): Promise<ReleaseResult | null>;

  getDigest?(config: DigestConfig, newValue?: string): Promise<string>;

  handleSpecificErrors(err: HttpError): void {}

  protected handleGenericErrors(err: HttpError): never {
    this.handleSpecificErrors(err);
    if (err.response?.statusCode !== undefined) {
      if (
        err.response?.statusCode === 429 ||
        (err.response?.statusCode >= 500 && err.response?.statusCode < 600)
      ) {
        throw new ExternalHostError(err);
      }
    }
    throw err;
  }
}
