---
name: project-rules
description: Core development rules for this project. Always apply these rules to all tasks and interactions.
---

# Project Development Rules

These rules must be followed for all development work in this project.

## Rule 1: Test-Driven Development (TDD)

**ALWAYS pursue test-driven development.**

- Write tests BEFORE implementing features
- Follow the Red-Green-Refactor cycle:
  1. Write a failing test (Red)
  2. Write minimal code to make it pass (Green)
  3. Refactor while keeping tests passing
- Maintain high test coverage for all new code
- Tests serve as documentation and regression prevention

## Rule 2: Branch-Based Development

**ALWAYS create branches and pursue new features on branches. Never corrupt the master branch.**

- Create a new branch for every feature, bugfix, or task
- Use descriptive branch names (e.g., `feature/user-authentication`, `fix/login-error`)
- Never commit directly to master/main branch
- All changes must go through pull/merge requests
- Ensure master branch always remains stable and deployable

## Rule 3: Never Update Master Directly - Invest in Git Tooling

**NEVER update master directly. Invest in git tooling to protect master.**

- Configure branch protection rules on the remote repository (GitHub/GitLab/etc):
  - Require pull request reviews before merging
  - Require status checks to pass before merging
  - Require branches to be up to date before merging
  - Include administrators in restrictions
- Use pre-commit hooks to prevent accidental master commits locally
- Configure CI/CD pipelines to block direct pushes to master
- Set up required approvals (minimum 1-2 reviewers)
- Enable merge queues if available
- Treat master as read-only; all changes flow through reviewed branches

## Rule 4: README Maintenance

**ALWAYS keep the README updated upon any code/logic changes.**

- Update README.md immediately when:
  - Adding new features or capabilities
  - Changing existing functionality
  - Modifying setup or configuration steps
  - Updating dependencies or requirements
  - Changing API endpoints or interfaces
- Keep documentation in sync with code
- Ensure new developers can understand the project from README alone

## Rule 5: Surgical Changes

**Keep changes surgical and targeted. No large scale overhauls.**

- Make small, focused changes that address specific requirements
- One change per branch/PR when possible
- Avoid refactoring unrelated code
- Minimize the surface area of changes
- Prefer incremental improvements over big rewrites
- Review and test thoroughly before moving to next change

## Enforcement

These rules are non-negotiable and apply to all development work. If a task cannot be completed while following these rules, escalate for discussion rather than bypassing the rules.
