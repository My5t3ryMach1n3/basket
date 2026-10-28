## Bearing

- To design or revise the target, follow the steps `bearing skill` prints: run `bearing context --issues`, write
  architecture/workspace.dsl, record key choices as ADRs in architecture/adrs/, then `bearing validate`.
  If you load skills, offer to save them as one with `bearing skill --install`, and only run it if the user agrees.
- Before coding an issue, run `bearing context #<issue>`; keep code inside the component paths it lists.
- Tag every integration test with its criterion, e.g. `#12/AC2`.
- For criteria that depend on time, such as expiry, pass the clock in as a dependency so tests set the time instead
  of waiting.
- Before pushing: `bearing claim`, `bearing test -- npm run test:integration`, `bearing check`.
- If a check fails, fix the code within the target. After 3 failed attempts, propose a target change in
  architecture/workspace.dsl on the same branch, with an ADR from architecture/adrs/template.md giving the reason and the alternatives
  you considered. If another target change merges first, rebase onto it and rework yours on top.
- Never edit .bearing/config.yaml or anything in .github/workflows/.
