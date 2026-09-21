"use strict";
// ZIPPY OPEN MATERIAL
//
// Build edition marker. Lets a future enterprise/customer build flip behavior
// (e.g. swap in a real @autoclaw/premium) without changing the public core.
// Read from AUTOCLAW_EDITION at module load; the published Marketplace VSIX and
// the source-available community build are functionally identical (free + trial
// + paid unlock) and both resolve to 'community' when the env is unset.
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTOCLAW_EDITION = void 0;
exports.isCommunityEdition = isCommunityEdition;
exports.isMarketplaceEdition = isMarketplaceEdition;
exports.isEnterpriseEdition = isEnterpriseEdition;
exports.AUTOCLAW_EDITION = process.env.AUTOCLAW_EDITION || 'community';
function isCommunityEdition() {
    return exports.AUTOCLAW_EDITION === 'community';
}
function isMarketplaceEdition() {
    return exports.AUTOCLAW_EDITION === 'marketplace';
}
function isEnterpriseEdition() {
    return exports.AUTOCLAW_EDITION === 'enterprise';
}
//# sourceMappingURL=edition.js.map