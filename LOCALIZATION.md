# Localization (i18n)

Axio supports **English**, **Traditional Chinese (zh-HK)**, and **Simplified Chinese (zh-CN)**.

## How it works

- **Cookie-based locale:** The selected language is stored in the `NEXT_LOCALE` cookie and persists across sessions.
- **Language switcher:** Available on the landing page, login, and register pages. Users select from: English | 繁體中文 | 简体中文.
- **Translation files:** Located in `messages/` — `en.json`, `zh-HK.json`, `zh-CN.json`.
- **Library:** [next-intl](https://next-intl.dev/) for server and client components.

## Adding translations

1. Add new keys to all three JSON files in `messages/`.
2. Use in components:
   - Server: `const t = await getTranslations('namespace')`
   - Client: `const t = useTranslations('namespace')`
3. Call `t('key')` for the translated string.

## Phased rollout (current)

- **Phase 1 (done):** Landing page, login, register, common auth strings.
- **Shared (done):** Sidebar (nav labels, sign out, role labels), 404 not-found page.
- **Phase 2 (done):** Trainee app (dashboard, profile, programs, sessions, progress, connect trainer, profile form, session log, exercise log, active programs list).
- **Phase 3 (done):** Trainer app — all pages (dashboard, programs, program detail, templates, subscription, trainees, trainee detail, trainee progress) and all components (ProgramForm, AssignTraineeForm, ConnectTraineeForm, ExerciseSelector, PricingCards, ManageBillingButton, TraineeList, TrainerProgressTracking, TrainerProgressPageContent).
- **Phase 4 (done):** Admin panel — all pages (dashboard, users, subscriptions, payments, reports, settings) and all components (AdminUsersTable, ExtendTrialButton, ReportExportButtons, StripeFeesSection, StripeSettingsForm).
- **Phase 5 (optional):** Privacy and Terms legal pages — full translation or “English only” notice.

## Time zone

For `zh-HK` and `zh-CN`, the time zone is set to `Asia/Hong_Kong` for date/time formatting.
