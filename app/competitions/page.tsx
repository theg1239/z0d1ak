import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { TerminalText } from "@/components/terminal-text"
import Link from "next/link"
import { ChevronRight, Folder, File, ChevronDown } from "lucide-react"
import { getLatestCompetitions } from "@/app/actions/getLatestTags"
import { unstable_cache } from "next/cache"

interface Competition {
  id: string
  name: string
  latestPost: string | null
  postCount: number
}

const getCachedCompetitions = unstable_cache(
  async () => {
    return getLatestCompetitions(100)
  },
  ["all-competitions"],
  { revalidate: 3600 },
)

function FileStructure({ competitions }: { competitions: Competition[] }) {
  return (
    <div className="font-mono text-sm">
      <div className="flex items-center gap-2 text-primary mb-2">
        <Folder className="h-4 w-4" />
        <span>competitions</span>
      </div>
      {competitions.map((competition) => (
        <div key={competition.id} className="ml-4 border-l border-primary/30 pl-4">
          <div className="flex items-center gap-2 text-white mb-2">
            <ChevronDown className="h-4 w-4 text-primary" />
            <Folder className="h-4 w-4 text-yellow-500" />
            <Link href={`/competitions/${competition.id}`} className="hover:underline">
              {competition.name}
            </Link>
            <span className="text-xs text-muted-foreground">({competition.postCount} writeups)</span>
          </div>
          <div className="ml-4 border-l border-primary/30 pl-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <File className="h-4 w-4" />
              <span>README.md</span>
            </div>
            {Array.from({ length: competition.postCount }).map((_, index) => (
              <div key={index} className="flex items-center gap-2 text-muted-foreground">
                <File className="h-4 w-4" />
                <span>writeup-{index + 1}.md</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default async function CompetitionsPage() {
  const competitions = await getCachedCompetitions()

  return (
    <div className="flex min-h-screen flex-col bg-black text-green-500">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-4 text-white">CTF Competitions</h1>
          <div className="inline-block rounded-lg bg-black border border-primary/30 px-3 py-1 text-sm mb-4">
            <TerminalText text="$ ls -R /competitions" typingSpeed={50} />
          </div>
        </div>

        <div className="bg-gray-900 border border-primary/30 rounded-lg p-6">
          <div className="mb-4 font-mono">
            <span className="text-blue-400">root@z0d1ak</span>:<span className="text-green-400">~</span>$ ls -R
            /competitions
          </div>
          <FileStructure competitions={competitions} />
        </div>

        <div className="mt-8 text-center">
          <Link href="/">
            <Button variant="outline" size="lg" className="gap-2 border-primary/50 text-primary hover:bg-primary/10">
              <ChevronRight className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}

