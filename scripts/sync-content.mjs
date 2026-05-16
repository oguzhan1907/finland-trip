import { mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const sourceRoot = "/Users/okiziltepe/Wikis/finland-trip-planning"
const contentRoot = path.resolve(__dirname, "..", "content")

const publishFiles = ["Home.md", "Trip Overview.md"]

const publishDirs = [
  "Country",
  "Routes",
  "Ferries",
  "Lodging",
  "Concepts",
  "Entities",
  "Sources",
]

const publishQueries = [
  "Queries/_Index.md",
  "Queries/Current Trip Constraints.md",
  "Queries/Open Planning Questions.md",
  "Queries/Decision Log.md",
  "Queries/Finland Roadtrip Source Shortlist.md",
]

const publishLogistics = [
  "Logistics/_Index.md",
  "Logistics/Route Planning.md",
  "Logistics/Roadtrip Operations.md",
  "Logistics/Packing.md",
  "Logistics/Food And Supplies.md",
]

const dashboardStubs = [
  "Dashboard.md",
  "Country/Dashboard.md",
  "Routes/Dashboard.md",
  "Ferries/Dashboard.md",
  "Lodging/Dashboard.md",
  "Logistics/Dashboard.md",
  "Sources/Dashboard.md",
  "Concepts/Dashboard.md",
  "Entities/Dashboard.md",
  "Queries/Dashboard.md",
]

const privateStubs = [
  "Logs/Change Log.md",
  "Logistics/Booking Tracker.md",
  "Logistics/Documents And Insurance.md",
  "Logistics/Budget.md",
]

async function pathExists(filePath) {
  try {
    await stat(filePath)
    return true
  } catch (error) {
    if (error.code === "ENOENT") return false
    throw error
  }
}

async function copyFile(relativePath) {
  const sourcePath = path.join(sourceRoot, relativePath)
  const targetPath = path.join(contentRoot, relativePath)

  if (!(await pathExists(sourcePath))) {
    throw new Error(`Missing source file: ${relativePath}`)
  }

  await mkdir(path.dirname(targetPath), { recursive: true })
  const content = await readFile(sourcePath, "utf8")
  await writeFile(targetPath, content)
}

async function copyDir(relativeDir) {
  const sourceDir = path.join(sourceRoot, relativeDir)
  const entries = await readdir(sourceDir, { withFileTypes: true })

  for (const entry of entries) {
    const childRelativePath = path.join(relativeDir, entry.name)
    if (entry.isDirectory()) {
      await copyDir(childRelativePath)
      continue
    }

    if (!entry.isFile()) continue
    if (!entry.name.endsWith(".md")) continue
    if (entry.name === "Dashboard.md") continue

    await copyFile(childRelativePath)
  }
}

function frontmatter(title, type = "query") {
  const today = new Date().toISOString().slice(0, 10)
  return `---\ntitle: ${JSON.stringify(title)}\ntype: ${type}\ncreated: ${today}\nupdated: ${today}\nsources: []\ntags:\n  - finland-roadtrip\n  - public-site\n---`
}

async function writeGeneratedPage(relativePath, title, body, type = "query") {
  const targetPath = path.join(contentRoot, relativePath)
  await mkdir(path.dirname(targetPath), { recursive: true })
  await writeFile(targetPath, `${frontmatter(title, type)}\n\n# ${title}\n\n${body.trim()}\n`)
}

async function writeIndex() {
  await writeGeneratedPage(
    "index.md",
    "Finland Roadtrip Wiki",
    [
      "A public reading view for the Finland roadtrip planning wiki.",
      "",
      "## Start Here",
      "",
      "- [[Home]]",
      "- [[Trip Overview]]",
      "- [[Routes/_Index|Routes]]",
      "- [[Lodging/_Index|Lodging]]",
      "- [[Ferries/_Index|Ferries]]",
      "- [[Queries/Open Planning Questions]]",
    ].join("\n"),
    "home",
  )
}

async function writeDashboardStubs() {
  for (const relativePath of dashboardStubs) {
    const title =
      relativePath === "Dashboard.md"
        ? "Dashboard"
        : `${path.dirname(relativePath)} Dashboard`

    await writeGeneratedPage(
      relativePath,
      title,
      [
        "This dashboard is intentionally omitted from the public Quartz site because it uses Obsidian Dataview queries.",
        "",
        "Use the section index pages instead:",
        "",
        "- [[Home]]",
        "- [[Trip Overview]]",
        "- [[Routes/_Index|Routes]]",
        "- [[Lodging/_Index|Lodging]]",
        "- [[Ferries/_Index|Ferries]]",
        "- [[Queries/Open Planning Questions]]",
      ].join("\n"),
      "dashboard",
    )
  }
}

async function writePrivateStubs() {
  const stubBodies = new Map([
    [
      "Logs/Change Log.md",
      "The detailed maintenance log is intentionally omitted from the public site. Use [[Home]] and [[Trip Overview]] for the current planning state.",
    ],
    [
      "Logistics/Booking Tracker.md",
      "The booking tracker is intentionally omitted from the public site because it can contain booking references, costs, cancellation terms, and operational details.",
    ],
    [
      "Logistics/Documents And Insurance.md",
      "The documents and insurance checklist is intentionally omitted from the public site because it can contain personal document, insurance, and emergency-contact details.",
    ],
    [
      "Logistics/Budget.md",
      "The budget page is intentionally omitted from the public site because it can contain private cost and payment planning details.",
    ],
  ])

  for (const relativePath of privateStubs) {
    const title = path.basename(relativePath, ".md")
    const body = `${stubBodies.get(relativePath)}\n\nReturn to [[Logistics/_Index]] or [[Home]].`
    await writeGeneratedPage(relativePath, title, body)
  }
}

async function main() {
  await rm(contentRoot, { recursive: true, force: true })
  await mkdir(contentRoot, { recursive: true })

  for (const file of publishFiles) await copyFile(file)
  for (const dir of publishDirs) await copyDir(dir)
  for (const query of publishQueries) await copyFile(query)
  for (const logisticsPage of publishLogistics) await copyFile(logisticsPage)

  await writeIndex()
  await writeDashboardStubs()
  await writePrivateStubs()

  console.log(`Synced public Quartz content to ${contentRoot}`)
}

await main()
