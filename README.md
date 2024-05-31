# u(nlinked)HTTP-crypto

Provides encryption and decryption functionality for uHTTP.

## Deployment

### Staging

-   staging can be deployed from main
-   run `yarn changeset version` to create current changelog
-   commit everything, create a matching tag and push to main
-   run publish action with `beta`(default) tag

### Production

-   production must be deployed from main
-   should come after a successful staging publishing
-   run publish action with `latest` tag
