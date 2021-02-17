import { Release, getPkgReleases } from '..';
import { getName } from '../../../test/util';
import { id as mavenVersioning } from '../../versioning/maven';
import { ClojureDatasource } from '.';

const config = {
  versioning: mavenVersioning,
  datasource: new ClojureDatasource().id,
};

describe(getName(__filename), () => {
  describe('getReleases', () => {
    function generateReleases(versions: string[]): Release[] {
      return versions.map((v) => ({ version: v }));
    }

    it('should return empty if library is not found', async () => {
      const releases = await getPkgReleases({
        ...config,
        depName: 'unknown:unknown',
        registryUrls: [
          's3://somewhere.s3.aws.amazon.com',
          'file://lib/datasource/maven/__fixtures__/repo1.maven.org/maven2/',
        ],
      });
      expect(releases).toBeNull();
    });

    it('should simply return all versions of a specific library', async () => {
      const releases = await getPkgReleases({
        ...config,
        depName: 'org.hamcrest:hamcrest-core',
        registryUrls: [
          'file://lib/datasource/maven/__fixtures__/repo1.maven.org/maven2/',
          'file://lib/datasource/maven/__fixtures__/custom_maven_repo/maven2/',
          's3://somewhere.s3.aws.amazon.com',
        ],
      });
      expect(releases.releases).toEqual(
        generateReleases([
          '1.1',
          '1.2',
          '1.2.1',
          '1.3.RC2',
          '1.3',
          '2.1-rc2',
          '2.1-rc3',
        ])
      );
    });
  });
});
