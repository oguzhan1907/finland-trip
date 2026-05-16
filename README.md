# Finland Roadtrip Wiki

Public Quartz site for a sanitized read-only view of the Finland roadtrip planning vault.

Source vault:

```txt
/Users/okiziltepe/Wikis/finland-trip-planning
```

Public site repo:

```txt
/Users/okiziltepe/Projects/finland-trip
```

## Workflow

Sync the public allowlist from the private Obsidian vault:

```sh
PATH="/opt/homebrew/opt/node/bin:$PATH" npm run sync-content
```

Build locally:

```sh
PATH="/opt/homebrew/opt/node/bin:$PATH" npm run build
```

Preview locally:

```sh
PATH="/opt/homebrew/opt/node/bin:$PATH" npm run serve
```

## Public Content Policy

The sync script publishes only selected Markdown pages from the vault. It excludes `raw/`, private logistics pages, Dataview dashboards, logs, templates, skills, `.obsidian/`, and repo-agent instructions.
