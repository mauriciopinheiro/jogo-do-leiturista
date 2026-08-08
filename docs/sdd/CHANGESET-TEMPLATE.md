# Change Set Template

Each implementation unit MUST receive a unique Change Set ID.

```yaml
change_sets:
  - id: CS-2026-0042
    spec: SPEC-2026-001
    requirements: [REQ-001]
    acceptance_criteria: [AC-001]
    tasks: [TASK-2026-003]
    files:
      - path: src/auth/token.py
        ranges:
          - start: 41
            end: 67
    evidence:
      - type: test
        reference: tests/auth/test_token.py::test_AC_001_rejects_expired_token
```

Rules:

- `id` MUST be unique.
- `spec` MUST reference an approved spec.
- requirement, acceptance-criterion, task, files and evidence lists MUST not be empty.
- every protected changed line MUST fall within a declared range.
- ranges SHOULD be as narrow as practical.
