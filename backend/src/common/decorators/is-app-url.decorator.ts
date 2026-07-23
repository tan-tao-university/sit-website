import { IsUrl, ValidationOptions } from 'class-validator';

// class-validator's default IsUrl() requires a dot-TLD (require_tld: true),
// which rejects http://localhost:8080/... — the shape every upload URL takes
// in local dev (see UploadService.uploadFile). Every URL field in this app
// can legitimately hold a self-hosted upload URL, so relax that check here
// instead of at each call site.
export function IsAppUrl(validationOptions?: ValidationOptions) {
  return IsUrl({ require_tld: false }, validationOptions);
}
