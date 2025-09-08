# License Analysis

This document summarizes the licensing model for the `twenty-core` project and its implications for our nonprofit CRM solution.

**Disclaimer:** This is not legal advice. It is a technical summary for project planning.

## Licensing Model

`twenty-core` uses a **dual-license** model:

1.  **GNU AGPL v3:** The majority of the codebase is licensed under the AGPLv3. This is a strong copyleft license. If we offer our combined solution (Twenty + fundraising service) as a hosted service, we are obligated to make the complete source code of our `fundraising-service` available to the users of that service.
2.  **Twenty Commercial License:** A subset of files, marked with `/* @license Enterprise */`, are under a commercial license and require a paid subscription from Twenty.com to be used in a production environment.

## Identified Enterprise Features

A search of the codebase reveals that the following core features are under the commercial license:

*   **Single Sign-On (SSO):** All logic related to SAML and OIDC.
*   **Billing & Subscriptions:** The built-in system for managing payments and plans.
*   **Custom Domains:** The feature that allows a workspace to be hosted on a custom domain.

## Implications for Our Project

*   Our business model can include charging for implementation, hosting, and support services.
*   We cannot create a proprietary, closed-source version of our fundraising pack if we offer it as a hosted service; our modifications must remain open-source under the AGPL.
*   Our planned `fundraising-service` does not appear to depend on any of the identified enterprise features, so we can proceed without needing a commercial license at this stage.
