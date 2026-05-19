# Push to GitHub (manual, once)

When laptop access is available, follow these steps to publish this package
under the `dash-tech` GitHub org.

## 1. Create the GitHub repo (private)

From the repo root (`/Users/irfanprimaputra.b/dash-mcp`):

```bash
gh repo create dash-tech/dash-mcp --private --source . --remote origin --push
```

This initializes the remote, pushes the current `main` branch, and sets
`origin` as the tracking remote.

## 2. Tag the v0.1.0 release

```bash
git tag v0.1.0
git push origin v0.1.0
```

GitHub will create the release page automatically. Add release notes via
the web UI or `gh release create v0.1.0 --notes "Initial release"`.

## 3. Distribute to PE consumers (Claude Code / Cursor MCP)

Once the repo is live, partners add the MCP server to their AI client
config by installing from GitHub:

```bash
npm i -g github:dash-tech/dash-mcp
```

Then in `~/.claude/config.json` (or equivalent client config):

```json
{
  "mcpServers": {
    "dash": {
      "command": "dash-mcp",
      "env": {
        "DASH_REGISTRY_URL": "https://ds.dash.com",
        "DASH_REGISTRY_TOKEN": "<paste-token>"
      }
    }
  }
}
```

## 4. Configure the production Bearer token

After deploying `dash-ds` to Vercel:

1. Generate a strong token: `openssl rand -hex 32`
2. Add it to Vercel as `DASH_REGISTRY_TOKEN` (Production + Preview envs).
3. Redeploy so the env var is picked up by the route handler.
4. Share the token with PE leads through a secure channel (1Password vault
   item `dash/registry-token`). They paste it into their MCP client config
   under `DASH_REGISTRY_TOKEN`.

## 5. Rotation

Rotate the token quarterly (or immediately if a PE leaves). Steps:

1. Generate new token, update Vercel env, redeploy.
2. Update the 1Password vault item.
3. Notify PEs to refresh their MCP client config.

Old token stops working the moment Vercel redeploys.
