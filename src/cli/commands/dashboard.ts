import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { join } from 'node:path'
import { loadConfig } from '../../config/config.js'
import { readHistory } from '../../measure/history.js'
import { computePrecision } from '../../measure/learn.js'

const PORT = 3030

function serveJson(res: ServerResponse, data: unknown): void {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}

function serveHtml(res: ServerResponse, html: string): void {
  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.end(html)
}

function renderDashboard(target: string): string {
  const history = readHistory({ root: target })
  const precision = computePrecision(history)
  const config = loadConfig(target)

  const totalRuns = history.length
  const passCount = history.filter((e) => e.verdict === 'PASS').length
  const failCount = history.filter((e) => e.verdict === 'FAIL').length
  const humanCount = history.filter((e) => e.verdict === 'HUMAN').length
  const passRate = totalRuns > 0 ? Math.round((passCount / totalRuns) * 100) : 0

  const recentRows = history
    .slice(-20)
    .reverse()
    .map(
      (e) => `
    <tr>
      <td>${new Date(e.timestamp).toLocaleString()}</td>
      <td>${e.task.slice(0, 50)}</td>
      <td>${e.type}</td>
      <td>${e.level}</td>
      <td class="verdict-${e.verdict.toLowerCase()}">${e.verdict}</td>
    </tr>`,
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>veridia dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0d1117; color: #c9d1d9; padding: 2rem; }
    h1 { color: #58a6ff; margin-bottom: 0.5rem; }
    h2 { color: #8b949e; font-size: 1rem; margin: 1.5rem 0 0.5rem; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; margin: 1rem 0; }
    .stat { background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 1rem; text-align: center; }
    .stat-value { font-size: 2rem; font-weight: 700; }
    .stat-label { font-size: 0.8rem; color: #8b949e; margin-top: 0.25rem; }
    .verdict-pass { color: #3fb950; }
    .verdict-fail { color: #f85149; }
    .verdict-human { color: #d29922; }
    table { width: 100%; border-collapse: collapse; margin-top: 0.5rem; }
    th, td { text-align: left; padding: 0.5rem; border-bottom: 1px solid #21262d; font-size: 0.85rem; }
    th { color: #8b949e; font-weight: 600; }
    tr:hover { background: #161b22; }
    .config { background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 1rem; margin-top: 1rem; font-family: monospace; font-size: 0.8rem; white-space: pre-wrap; }
  </style>
</head>
<body>
  <h1>veridia dashboard</h1>
  <p style="color:#8b949e;margin-bottom:1rem">Target: ${target}</p>

  <div class="stats">
    <div class="stat"><div class="stat-value">${totalRuns}</div><div class="stat-label">Total Runs</div></div>
    <div class="stat"><div class="stat-value verdict-pass">${passCount}</div><div class="stat-label">PASS</div></div>
    <div class="stat"><div class="stat-value verdict-fail">${failCount}</div><div class="stat-label">FAIL</div></div>
    <div class="stat"><div class="stat-value verdict-human">${humanCount}</div><div class="stat-label">HUMAN</div></div>
    <div class="stat"><div class="stat-value">${passRate}%</div><div class="stat-label">Pass Rate</div></div>
  </div>

  <h2>Recent Runs</h2>
  <table>
    <thead><tr><th>Time</th><th>Task</th><th>Type</th><th>Level</th><th>Verdict</th></tr></thead>
    <tbody>${recentRows}</tbody>
  </table>

  <h2>Oracle Precision</h2>
  <div class="stats">
    ${Object.entries(precision)
      .map(([kind, prec]) => `<div class="stat"><div class="stat-value">${(prec * 100).toFixed(0)}%</div><div class="stat-label">${kind}</div></div>`)
      .join('')}
  </div>

  <h2>Configuration</h2>
  <div class="config">${JSON.stringify(config, null, 2)}</div>
</body>
</html>`
}

export async function handle(opts: { target?: string; port?: string }): Promise<void> {
  const target = opts.target ? join(process.cwd(), opts.target) : process.cwd()
  const port = opts.port ? Number(opts.port) : PORT

  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    if (req.url === '/api/history') {
      serveJson(res, readHistory({ root: target }))
    } else if (req.url === '/api/precision') {
      serveJson(res, computePrecision(readHistory({ root: target })))
    } else if (req.url === '/api/config') {
      serveJson(res, loadConfig(target))
    } else {
      serveHtml(res, renderDashboard(target))
    }
  })

  server.listen(port, () => {
    process.stdout.write(`veridia dashboard running at http://localhost:${port}\n`)
  })

  await new Promise(() => {})
}
