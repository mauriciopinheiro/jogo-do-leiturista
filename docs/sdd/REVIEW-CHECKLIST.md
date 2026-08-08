# SDD Review Checklist

## Specification
- [ ] Governing spec identified and APPROVED.
- [ ] Requirements uniquely identified.
- [ ] Acceptance criteria testable.
- [ ] Material ambiguities resolved.

## Scope
- [ ] Diff limited to authorized behavior.
- [ ] No unrelated refactoring.
- [ ] Existing out-of-scope behavior preserved.

## Traceability
- [ ] Every protected changed line covered.
- [ ] Every Change Set maps to REQ, AC and TASK IDs.
- [ ] Every Change Set has evidence.

## Tests
- [ ] Each affected AC has evidence.
- [ ] Tests were not weakened just to pass.
- [ ] Relevant regression tests pass.

## Security / Data
- [ ] Auth/authz impact reviewed.
- [ ] Sensitive data impact reviewed.
- [ ] Logging/telemetry impact reviewed.
- [ ] Migration/rollback reviewed.

## Completion
- [ ] SDD validator passes.
- [ ] CI passes.
- [ ] Deviations explicitly documented.
- [ ] Remaining risks explicit.
