# Lefthook Setup for Reply Speed Insights

This project uses [Lefthook](https://github.com/evilmartians/lefthook) to manage Git hooks and ensure code quality before commits.

## What's Configured

### Pre-commit Hooks

- **Tests**: Runs `pnpm test:quiet` to ensure all tests pass
- **Build**: Runs `pnpm build` to ensure the project compiles
- **Lint**: Runs `pnpm lint` to check code style

### Pre-push Hooks

- **Test Coverage**: Runs full test suite with coverage
- **Performance Audit**: Runs performance checks

### Post-commit Hooks

- **Success Notification**: Shows confirmation message

### Commit Message Hooks

- **Format Check**: Enforces conventional commit message format

### Post-merge/Post-checkout Hooks

- **Dependency Installation**: Auto-installs dependencies when package files change

## Usage

### Install Hooks

```bash
pnpm lefthook:install
# or
pnpm lefthook install
```

### Uninstall Hooks

```bash
pnpm lefthook:uninstall
# or
pnpm lefthook uninstall
```

### Run Hooks Manually

```bash
# Run all pre-commit hooks
pnpm lefthook run pre-commit

# Run all pre-push hooks
pnpm lefthook run pre-push

# Run specific hook
pnpm lefthook run pre-commit test
```

### Skip Hooks (Emergency)

```bash
# Skip all hooks for a commit
git commit --no-verify -m "fix: emergency fix"

# Skip specific hook
LEFTHOOK=0 git commit -m "fix: skip hooks"
```

## Configuration

The configuration is in `lefthook.yml`. Key features:

- **Parallel Execution**: Hooks run in parallel for faster feedback
- **File Filtering**: Hooks only run when relevant files are changed
- **Clear Error Messages**: Helpful error messages when hooks fail
- **Conventional Commits**: Enforces commit message format

## Benefits

1. **Faster CI**: Build and test issues caught locally before pushing
2. **Consistent Quality**: All commits are tested and built
3. **Better Commits**: Enforced commit message format
4. **Auto-dependency Management**: Dependencies installed automatically
5. **Performance Monitoring**: Regular performance audits

## Troubleshooting

### Hook Fails

1. Fix the issues shown in the error message
2. Stage your changes: `git add .`
3. Try committing again: `git commit -m "your message"`

### Performance Issues

- Hooks run in parallel, but if still slow, consider:
  - Using `pnpm test:quiet` instead of full test suite
  - Excluding certain file patterns in `lefthook.yml`

### Bypass Hooks

- Only use `--no-verify` in emergencies
- Always run hooks manually after bypassing: `pnpm lefthook run pre-commit`
