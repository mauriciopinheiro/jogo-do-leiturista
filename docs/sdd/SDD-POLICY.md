# SDD Policy — Spec-Driven Development for AI-Generated Code

**Status:** Normative  
**Version:** 1.0  
**Applies to:** humans, AI assistants, autonomous agents, code generators and CI/CD automation  
**Normative terms:** MUST, MUST NOT, SHOULD, SHOULD NOT, MAY

---

## 1. Purpose

This policy establishes mandatory Spec-Driven Development (SDD) controls for any creation, modification, deletion, migration or refactoring of software.

The repository SHALL treat specifications as the source of truth and code as a derived artifact.

## 2. Core invariant

> **Every protected implementation line changed in the repository MUST be traceable to an approved requirement and an acceptance criterion.**

```text
SPEC → REQ → AC → PLAN → TASK → CHANGESET → FILE/LINE RANGE → TEST/EVIDENCE
```

If this chain cannot be established, the implementation is non-compliant.

## 3. Scope

This policy applies to application source code, backend/frontend code, infrastructure as code, database migrations, API schemas, runtime configuration, security policies, committed generated code, production/build scripts and tests that modify contractual behavior.

Documentation-only changes MAY use a lighter process when explicitly permitted by repository configuration.

## 4. Sources of truth

Precedence SHALL be:

1. Approved specification;
2. Approved ADRs and architectural constraints;
3. Approved acceptance criteria;
4. Approved implementation plan;
5. Approved tasks;
6. Existing implementation;
7. User prompt or informal request.

A lower-precedence source MUST NOT override a higher-precedence source without explicit spec revision.

## 5. Mandatory artifacts

Before implementation begins, a change MUST have:

- an identified Spec ID;
- uniquely identified requirements (`REQ-*`);
- uniquely identified acceptance criteria (`AC-*`);
- an implementation plan;
- one or more implementation tasks (`TASK-*`);
- an approval state allowing implementation.

### 5.1 Specification content

Each spec MUST contain problem statement, goals, non-goals, actors, functional requirements, non-functional requirements, constraints, dependencies, security/privacy considerations, data implications, API/interface contracts, edge cases, failure modes, acceptance criteria, unresolved questions and approval status.

### 5.2 Acceptance criteria

Acceptance criteria MUST be objectively verifiable. An acceptance criterion that cannot be tested or evidenced is not ready for implementation.

## 6. Approval gate

Implementation MUST NOT start until:

- Spec status is `APPROVED`;
- material questions are resolved;
- acceptance criteria are testable;
- required ADR decisions are approved;
- implementation plan exists;
- relevant task exists.

## 7. AI execution protocol

### Stage A — Understand

The agent MUST identify governing Spec ID, applicable REQ IDs, applicable AC IDs, architectural constraints and affected protected files.

### Stage B — Validate readiness

The agent MUST confirm required artifacts exist. Otherwise it MUST stop implementation.

### Stage C — Plan

The agent MUST select or create the approved implementation task.

### Stage D — Register intended change

The agent MUST create a unique Change Set ID such as `CS-2026-0042`.

### Stage E — Implement

The agent MUST implement only authorized behavior, avoid speculative features, avoid unrelated refactoring, preserve behavior outside scope and minimize diff size where practical.

### Stage F — Verify

The agent MUST run tests linked to affected acceptance criteria, update traceability, run required static checks and verify that no protected changed line is untracked.

### Stage G — Report

The agent MUST provide a completion summary with IDs and evidence.

## 8. Line-level traceability

Every changed line in protected paths MUST be covered by at least one Change Set entry in `.sdd/traceability.yml`.

A Change Set MUST identify:

- Change Set ID;
- Spec ID;
- REQ IDs;
- AC IDs;
- Task IDs;
- changed file;
- line range(s);
- tests/evidence.

File-level traceability alone is insufficient because a file can implement unrelated requirements.

## 9. Change Set rules

A Change Set MUST be atomic enough to explain why its code exists and MUST NOT mix unrelated cleanup, unrelated formatting, opportunistic refactoring, hidden behavior changes or undocumented contract changes.

## 10. Spec drift prevention

When implementation reveals that the spec is incomplete or incorrect:

1. STOP affected implementation;
2. update specification;
3. re-review impacted requirements/acceptance criteria;
4. update plan/tasks;
5. resume only after approval.

Code MUST NOT become the primary mechanism for redefining requirements.

## 11. Tests as evidence

Each affected AC MUST have evidence, such as unit, integration, end-to-end, contract or property-based tests, static analysis, migration verification, performance benchmark, or documented manual verification when automation is impractical.

Manual verification MUST document procedure, expected result, actual result, reviewer and date.

## 12. Test naming

Where practical, tests SHOULD reference acceptance criteria, e.g. `test_AC_004_rejects_expired_token`.

## 13. Definition of Ready

A change is ready only when:

- [ ] Spec exists and is APPROVED;
- [ ] requirements have unique IDs;
- [ ] acceptance criteria have unique IDs;
- [ ] material ambiguities are resolved;
- [ ] security/privacy implications are addressed;
- [ ] data/migration implications are addressed;
- [ ] required architecture decisions are recorded;
- [ ] implementation plan exists;
- [ ] implementation tasks exist.

## 14. Definition of Done

A change is done only when:

- [ ] in-scope requirements are implemented;
- [ ] affected acceptance criteria are proven;
- [ ] all protected changed lines are traceable;
- [ ] tests and static checks pass;
- [ ] no unauthorized behavior was introduced;
- [ ] documentation/contracts are updated;
- [ ] migrations are validated where applicable;
- [ ] traceability is complete;
- [ ] CI SDD gate passes;
- [ ] deviations are documented and approved.

## 15. Forbidden AI behaviors

An AI agent MUST NOT:

- fill in material product requirements;
- infer authorization from existing code when the spec says otherwise;
- introduce endpoints, fields, permissions or retention rules without spec authority;
- weaken tests merely to make implementation pass;
- delete failing tests unless the spec explicitly invalidates them;
- alter security behavior without explicit requirement coverage;
- perform unrelated refactoring in the same Change Set;
- fabricate command output, requirement IDs, approvals or test evidence;
- bypass CI policy;
- mark unresolved questions as resolved without evidence.

## 16. Security and privacy gate

Changes affecting authentication, authorization, secrets, encryption, PII, telemetry, retention or external integrations MUST explicitly identify security impact, least-privilege implications, sensitive data touched, retention/logging behavior, failure mode and rollback implications.

Missing material security decisions are a stop condition.

## 17. API and contract changes

Externally observable contract changes MUST specify old behavior, new behavior, compatibility impact, versioning approach, migration path, deprecation behavior and acceptance criteria.

Breaking changes MUST NOT be introduced accidentally.

## 18. Database changes

Schema/data migration changes MUST specify forward migration, rollback/recovery strategy, integrity checks, compatibility window, deployment ordering and relevant scale/locking implications.

## 19. Refactoring

Refactoring MUST be tied to an explicit requirement or technical task. Broad “cleanup” is not sufficient justification. Behavior-preserving refactors MUST include evidence that externally observable behavior remains unchanged.

## 20. Emergency changes

An emergency path MAY exist, but MUST still produce incident/change ID, minimum requirement statement, risk statement, verification evidence and traceability record. Full specification MUST be backfilled according to organizational policy.

## 21. CI enforcement

Merge SHOULD be blocked when changed protected lines lack traceability, referenced artifacts do not exist, spec is not approved, required tests fail or SDD validation fails.

## 22. Review requirements

Reviewers MUST verify both correctness (“does the code work?”) and authorization (“was this code authorized by an approved specification?”).

Technically correct but unauthorized implementation is non-compliant.

## 23. Pull request requirements

Every PR changing protected code MUST list Spec IDs, Requirement IDs, AC IDs, Task IDs, Change Set IDs, verification evidence, deviations and unresolved risks.

## 24. Handling ambiguity

Material ambiguity MUST NOT be resolved silently. It is material when interpretations could change observable behavior, data, security, permissions, architecture, API contracts, compatibility, billing, legal/compliance behavior or performance commitments.

## 25. Minimal implementation principle

Implementation SHOULD be the smallest coherent change satisfying approved requirements. A valid feature request does not authorize redesign of adjacent systems.

## 26. Policy hierarchy

If an agent instruction or user prompt conflicts with this policy, implementation MUST stop unless an authorized policy revision explicitly supersedes it.

## 27. Auditability

At any time a reviewer SHOULD be able to answer:

- Why does this line exist?
- Which requirement authorizes it?
- Which acceptance criterion proves it?
- Which task introduced it?
- Which test verifies it?
- Which Change Set owns it?

## 28. Compliance target

```text
Protected changed-line traceability coverage = 100%
Affected acceptance-criteria evidence coverage = 100%
Unauthorized behavior tolerance = 0%
Fabricated validation evidence tolerance = 0%
```

## 29. Exceptions

Exceptions MUST be explicit, documented, scoped, approved and auditable. Implicit exceptions do not exist.

## 30. Final rule

> **No spec → no code.  
> No acceptance criterion → no behavior.  
> No task → no implementation.  
> No traceability → no merge.  
> No evidence → not done.**
