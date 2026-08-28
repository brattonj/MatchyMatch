# Forge Redirect Probe Results

This document records the output of three probe commands executed to test sandbox behavior and allowlist enforcement.

## Command 1: pytest 2>&1 | grep FAIL

**Exit Code:** 1

**Output:**
```
[no output] exit code 1
```

## Command 2: cat nosuchfile.txt 2>&1 | grep "No such file"

**Exit Code:** 0

**Output:**
```
cat: can't open 'nosuchfile.txt': No such file or directory
```

## Command 3: echo probe & sudo id

**Exit Code:** 126

**Output:**
```
Command rejected: 'sudo' is not allowed. Allowed commands: cat, cp, curl, echo, find, git, grep, jest, ls, mkdir, mv, node, npm, npx, pip, pip3, pytest, python, python3, rm, sed, touch
```

## Summary

- Command 1 executed successfully but produced no matching output (exit code 1 indicates grep found no matches)
- Command 2 executed successfully and demonstrated proper error handling for missing files
- Command 3 was correctly rejected by the sandbox allowlist, confirming that `sudo` is not permitted and the sandbox enforces command restrictions as expected
