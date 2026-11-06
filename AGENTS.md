# Repository Guidelines

## Project Structure & Module Organization

This repository is currently an empty project workspace. No source code, tests, assets, or dependency manifests are present. When adding the initial implementation, keep the directory layout simple and document its purpose here. Suggested locations are `src/` for application code, `tests/` for automated tests, and `assets/` for static resources; create only the directories the project needs.

## Build, Test, and Development Commands

No build system, development server, or test commands are configured yet. Do not assume commands such as `npm test` or `make build` are available. When introducing a toolchain, add its dependency manifest and document the exact installation, local development, build, and test commands in `README.md`. Prefer project-local tools and reproducible dependency versions.

## Coding Style & Naming Conventions

No language-specific style or formatter has been established. Follow the conventions of the chosen language, use consistent indentation within each file, and choose descriptive names for files, functions, and variables. Add formatter and lint configuration alongside the first implementation when appropriate. Avoid mixing unrelated formatting changes with functional changes.

## Testing Guidelines

No testing framework or coverage threshold is configured. Add tests for new behavior and bug fixes once executable code exists. Use descriptive test names that explain the expected behavior, and follow the selected framework’s file naming conventions. Document how to run the tests and any required setup.

## Commit & Pull Request Guidelines

The workspace has no Git history, so no existing commit convention can be inferred. If Git is initialized, use concise, imperative commit subjects such as `Add initial project structure`. Keep commits focused. Pull requests should explain the change, its purpose, and validation performed; link relevant issues and include screenshots for visible interface changes.

## Security & Configuration

Never commit credentials, access tokens, or private configuration. Document required environment variables with placeholder values. Add appropriate ignore rules when introducing generated files, dependencies, or local configuration.