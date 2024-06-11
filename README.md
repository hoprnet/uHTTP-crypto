# u(nlinked)HTTP-crypto

Provides encryption and decryption functionality for uHTTP.

## Deployment

### Staging

-   staging can be deployed from any branch
-   set a version tag manually in package.json with a suffix to differentiate it from the main versioning scheme (e.g. `-beta`)
-   run publish action with `beta` tag from that branch

### Production

-   production must be deployed from main
-   run `yarn changeset version` to create the current changelog
-   run `yarn build` to update version info
-   commit everything, create a matching tag and push to main
-   run publish action with `latest` tag
