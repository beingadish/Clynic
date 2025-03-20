Here's your content formatted correctly for Markdown:


# Traditional Git Commit Message Format (Conventional Commits)

## Format:

```md
<type>(<scope>): <short description>

<body>

<footer>
```

---

### Explanation:

- **`<type>`**: Specifies the category of the change
    - `feat`: A new feature
    - `fix`: A bug fix
    - `docs`: Documentation updates
    - `style`: Code style changes (formatting, whitespace, etc.)
    - `refactor`: Code restructuring without changing functionality
    - `perf`: Performance improvements
    - `test`: Adding or modifying tests
    - `chore`: Changes to build process, CI/CD, or maintenance

- **`<scope>`** *(optional)*: The module or component affected
    - Example: `feat(auth)`, `fix(ui)`, `docs(readme)`

- **`<short description>`**: Brief summary (≤ 50 characters)
    - Written in present tense (e.g., "fix button alignment")
    - No period (`.`) at the end

- **`<body>`** *(optional)*: Detailed explanation of the change
    - Uses imperative mood (e.g., "Change function logic")
    - Explains what, why, and how the change was made

- **`<footer>`** *(optional)*: Extra metadata like breaking changes or issue references
    - Example:
      ```
      BREAKING CHANGE: Removes deprecated API
      Fixes #123 / Closes #456
      ```

---

## Examples:

✅ **Feature Addition**
```bash
git commit -m "feat(auth): add JWT authentication support"
```

✅ **Bug Fix**
```bash
git commit -m "fix(ui): resolve button alignment issue"
```

✅ **Documentation Update**
```bash
git commit -m "docs(readme): update installation instructions"
```

✅ **Code Refactoring**
```bash
git commit -m "refactor(db): optimize query execution for better performance"
```

✅ **Breaking Change**
```bash
git commit -m "feat(api): remove deprecated endpoints

BREAKING CHANGE: The /v1/users endpoint has been removed. Please use /v2/users instead for fetching user data."
```

---

## Best Practices:
✔ Keep the first line ≤ 50 characters  
✔ Wrap body lines to ≤ 72 characters  
✔ Use imperative mood (e.g., "Add feature" instead of "Added feature")  
✔ Reference issues (e.g., "Fixes #42")  
✔ Be clear and concise
```

Now it will be properly formatted in Markdown! 🚀