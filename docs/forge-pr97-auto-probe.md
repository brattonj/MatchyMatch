# Forge PR97 Auto Command Recovery Probe

This document records the results of the disposable PR97 command-recovery probe.
Never merge this PR.

## Command Results (Plan 1)

| # | Command | stdout | exit code |
|---|---------|--------|-----------|
| 1 | `cat /tmp/forge-pr97-missing-a` | `cat: /tmp/forge-pr97-missing-a: No such file or directory` | 1 |
| 2 | `cat /tmp/forge-pr97-missing-a` | `cat: /tmp/forge-pr97-missing-a: No such file or directory` | 1 |
| 3 | `ls /tmp/forge-pr97-missing-b` | `ls: cannot access '/tmp/forge-pr97-missing-b': No such file or directory` | 2 |
| 4 | `grep marker /tmp/forge-pr97-missing-c` | `grep: /tmp/forge-pr97-missing-c: No such file or directory` | 2 |
| 5 | `echo PR97_RESET_OK` | `PR97_RESET_OK` | 0 |
| 6 | `cat /tmp/forge-pr97-missing-a` | `cat: /tmp/forge-pr97-missing-a: No such file or directory` | 1 |
| 7 | `cat /tmp/forge-pr97-missing-a` | `cat: /tmp/forge-pr97-missing-a: No such file or directory` | 1 |
| 8 | `echo PR97_OUTPUT_OK` | `PR97_OUTPUT_OK` | 0 |

## Observed stdout markers

- `PR97_RESET_OK` (command 5, exit 0)
- `PR97_OUTPUT_OK` (command 8, exit 0)

## Notes

- Missing-path commands (1–4, 6–7) all failed as expected with non-zero exit codes.
- The probe continued past each error without aborting, confirming command-recovery behaviour.
- No files were created at the missing paths.
