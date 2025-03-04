import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import { getLatestCompetitions } from "@/app/actions/getLatestTags"
import { notFound } from "next/navigation"
import {
  Terminal,
  Shield,
  Lock,
  Unlock,
  Zap,
  Trophy,
  Flag,
  Code,
  FileText,
  Search,
  User,
  Calendar,
  ChevronLeft,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react"

interface Competition {
  id: string
  name: string
  latestPost: string | null
  postCount: number
}

interface Challenge {
  id: string
  name: string
  category: string
  difficulty: "easy" | "medium" | "hard" | "insane"
  points: number
  solved: boolean
  description: string
}

// This would normally come from your database
// For now we'll generate mock challenges based on the competition
async function getCompetition(name: string) {
    const competitions = await getLatestCompetitions(100)
    const competition = competitions.find((comp) => comp.name === name)
  
    if (!competition) {
      return null
    }
  

  // Generate mock challenges based on the competition
  const categories = ["web", "crypto", "forensics", "pwn", "reverse", "osint"]
  const difficulties = ["easy", "medium", "hard", "insane"]

  const challenges: Challenge[] = Array.from({ length: Math.max(8, competition.postCount * 2) }).map((_, i) => {
    const category = categories[Math.floor(Math.random() * categories.length)]
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)] as Challenge["difficulty"]
    const points =
      difficulty === "easy"
        ? Math.floor(Math.random() * 200) + 100
        : difficulty === "medium"
          ? Math.floor(Math.random() * 300) + 200
          : difficulty === "hard"
            ? Math.floor(Math.random() * 400) + 300
            : Math.floor(Math.random() * 500) + 400

    return {
      id: `challenge-${i}`,
      name: `${competition.name} Challenge ${i + 1}`,
      category,
      difficulty,
      points,
      solved: Math.random() > 0.6,
      description: `This is a ${difficulty} ${category} challenge worth ${points} points.`,
    }
  })

  return {
    ...competition,
    challenges,
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 1 week ago
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), // 1 week from now
    website: "https://ctftime.org",
    teamSize: Math.floor(Math.random() * 5) + 3,
    totalPoints: challenges.reduce((sum, challenge) => sum + challenge.points, 0),
    earnedPoints: challenges
      .filter((challenge) => challenge.solved)
      .reduce((sum, challenge) => sum + challenge.points, 0),
  }
}

function getCategoryIcon(category: string) {
  switch (category.toLowerCase()) {
    case "web":
      return <Code className="h-5 w-5 text-blue-400" />
    case "crypto":
      return <Shield className="h-5 w-5 text-green-400" />
    case "forensics":
      return <Zap className="h-5 w-5 text-yellow-400" />
    case "pwn":
      return <Terminal className="h-5 w-5 text-red-400" />
    case "reverse":
      return <FileText className="h-5 w-5 text-purple-400" />
    case "osint":
      return <Search className="h-5 w-5 text-orange-400" />
    default:
      return <Flag className="h-5 w-5 text-primary" />
  }
}

function getDifficultyColor(difficulty: Challenge["difficulty"]) {
  switch (difficulty) {
    case "easy":
      return "text-green-400 border-green-400/30 bg-green-400/10"
    case "medium":
      return "text-yellow-400 border-yellow-400/30 bg-yellow-400/10"
    case "hard":
      return "text-orange-400 border-orange-400/30 bg-orange-400/10"
    case "insane":
      return "text-red-400 border-red-400/30 bg-red-400/10"
  }
}

export default async function CompetitionPage(props: { params: { name: string } }) {
  // Await the params before destructuring its properties
  const { name } = await Promise.resolve(props.params)
  const competition = await getCompetition(name)

  if (!competition) {
    notFound()
  }

  // Group challenges by category
  const challengesByCategory: Record<string, Challenge[]> = {}
  competition.challenges.forEach((challenge) => {
    if (!challengesByCategory[challenge.category]) {
      challengesByCategory[challenge.category] = []
    }
    challengesByCategory[challenge.category].push(challenge)
  })

  // Calculate progress percentage
  const progressPercentage = Math.round((competition.earnedPoints / competition.totalPoints) * 100)

  return (
    <div className="min-h-screen bg-black text-green-500 flex flex-col">
      <SiteHeader />

      <main className="flex-1 relative">
        {/* Animated background grid */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0a0a0a_1px,transparent_1px),linear-gradient(to_bottom,#0a0a0a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
        </div>

        {/* Competition header */}
        <div className="relative z-10 pt-8 pb-4 border-b border-primary/20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <Link
                  href="/competitions"
                  className="inline-flex items-center text-sm text-primary hover:underline mb-2"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back to Competitions
                </Link>
                <h1 className="text-3xl md:text-4xl font-bold text-white">{competition.name}</h1>
              </div>

              <div className="flex items-center gap-3">
                <Link href={competition.website} target="_blank" rel="noopener noreferrer">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border-primary/50 text-primary hover:bg-primary/10"
                  >
                    Visit CTF Site
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>

                <Link href={`/writeups?competition=${competition.id}`}>
                  <Button variant="hacker" size="sm" className="gap-2">
                    <FileText className="h-4 w-4" />
                    View Writeups
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Competition stats */}
        <div className="relative z-10 py-6 border-b border-primary/20 bg-black/50 backdrop-blur-sm">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-900/50 border border-primary/20 rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1">Status</div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="text-white font-medium">Active</span>
                </div>
              </div>

              <div className="bg-gray-900/50 border border-primary/20 rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1">Team Size</div>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <span className="text-white font-medium">{competition.teamSize} members</span>
                </div>
              </div>

              <div className="bg-gray-900/50 border border-primary/20 rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1">Date</div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="text-white font-medium">{formatDate(competition.startDate)}</span>
                </div>
              </div>

              <div className="bg-gray-900/50 border border-primary/20 rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1">Progress</div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  <span className="text-white font-medium">{progressPercentage}% complete</span>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-6 bg-gray-900/50 border border-primary/20 rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <div className="text-sm text-muted-foreground">
                  <span className="text-white font-medium">{competition.earnedPoints}</span> / {competition.totalPoints} points
                </div>
                <div className="text-sm text-primary font-medium">{progressPercentage}%</div>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Challenge grid - Radical design */}
        <div className="relative z-10 py-8">
          <div className="container px-4 md:px-6">
            <h2 className="text-2xl font-bold text-white mb-6">Challenges</h2>

            {/* 3D Hexagonal Grid Layout */}
            <div className="perspective-[1000px] transform-gpu">
              <div className="transform-style-3d rotate-x-12 mb-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(challengesByCategory).map(([category, challenges], categoryIndex) => (
                    <div
                      key={category}
                      className="transform-style-3d"
                      style={{
                        transform: `translateZ(${categoryIndex * 10}px)`,
                        transition: "transform 0.3s ease",
                      }}
                    >
                      <div className="bg-gray-900/80 backdrop-blur-sm border border-primary/30 rounded-lg overflow-hidden hover:border-primary/60 transition-all duration-300 shadow-lg hover:shadow-primary/20">
                        <div className="bg-gray-800 px-4 py-3 border-b border-primary/20 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(category)}
                            <h3 className="text-lg font-bold text-white capitalize">{category}</h3>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {challenges.filter((c) => c.solved).length} / {challenges.length} solved
                          </div>
                        </div>

                        <div className="p-4">
                          <div className="space-y-3">
                            {challenges.map((challenge, i) => (
                              <div
                                key={challenge.id}
                                className={`relative group p-3 border rounded-lg transition-all duration-300 ${
                                  challenge.solved
                                    ? "border-green-500/30 bg-green-500/5"
                                    : "border-gray-700 bg-black/40 hover:border-primary/30 hover:bg-primary/5"
                                }`}
                                style={{
                                  transform: `translateZ(${i * 5}px)`,
                                  transition: "all 0.2s ease",
                                }}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-medium text-white">{challenge.name}</h4>
                                      {challenge.solved ? (
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                      ) : (
                                        <div className="hidden group-hover:block">
                                          <XCircle className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-1">
                                      {challenge.description}
                                    </p>
                                  </div>

                                  <div className="flex flex-col items-end ml-2">
                                    <div className={`text-xs px-2 py-0.5 rounded-full border ${getDifficultyColor(challenge.difficulty)}`}>
                                      {challenge.difficulty}
                                    </div>
                                    <div className="text-xs text-primary mt-1">{challenge.points} pts</div>
                                  </div>
                                </div>

                                <div className="absolute -right-2 -top-2">
                                  {challenge.solved ? (
                                    <Unlock className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Lock className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </div>

                                {/* Hover effect */}
                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-lg"></div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Team Scoreboard */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-white mb-6">Team Progress</h2>

              <div className="bg-gray-900/80 backdrop-blur-sm border border-primary/30 rounded-lg overflow-hidden">
                <div className="bg-gray-800 px-4 py-3 border-b border-primary/20">
                  <h3 className="text-lg font-bold text-white">z0d1ak Team Scoreboard</h3>
                </div>

                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Radar Chart (simulated) */}
                    <div className="flex-1 md:w-1/2 aspect-square max-w-[400px] mx-auto md:mx-0 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-full max-w-[300px] max-h-[300px] relative">
                          {/* Radar background */}
                          <div className="absolute inset-0 border-2 border-primary/20 rounded-full"></div>
                          <div className="absolute inset-[15%] border-2 border-primary/20 rounded-full"></div>
                          <div className="absolute inset-[30%] border-2 border-primary/20 rounded-full"></div>
                          <div className="absolute inset-[45%] border-2 border-primary/20 rounded-full"></div>
                          <div className="absolute inset-[60%] border-2 border-primary/20 rounded-full"></div>
                          <div className="absolute inset-[75%] border-2 border-primary/20 rounded-full"></div>

                          {/* Radar lines */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-0.5 bg-primary/20 rotate-0"></div>
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-0.5 bg-primary/20 rotate-60"></div>
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-0.5 bg-primary/20 rotate-120"></div>
                          </div>

                          {/* Radar data (simulated) */}
                          <div className="absolute inset-0">
                            <svg viewBox="0 0 100 100" className="w-full h-full">
                              <polygon
                                points="50,10 90,30 80,80 20,80 10,30"
                                fill="rgba(16, 185, 129, 0.2)"
                                stroke="rgba(16, 185, 129, 0.8)"
                                strokeWidth="1"
                              />
                            </svg>
                          </div>

                          {/* Category labels */}
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 text-xs text-primary">
                            Web
                          </div>
                          <div className="absolute top-1/4 right-0 translate-x-4 text-xs text-primary">Crypto</div>
                          <div className="absolute bottom-1/4 right-0 translate-x-4 text-xs text-primary">
                            Forensics
                          </div>
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-4 text-xs text-primary">
                            Pwn
                          </div>
                          <div className="absolute bottom-1/4 left-0 -translate-x-4 text-xs text-primary">Reverse</div>
                          <div className="absolute top-1/4 left-0 -translate-x-4 text-xs text-primary">OSINT</div>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex-1 md:w-1/2">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-800/50 border border-primary/20 rounded-lg p-4">
                          <div className="text-xs text-muted-foreground mb-1">Web</div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Code className="h-4 w-4 text-blue-400" />
                              <span className="text-white font-medium">
                                {challengesByCategory["web"]?.filter((c) => c.solved).length || 0} / {challengesByCategory["web"]?.length || 0}
                              </span>
                            </div>
                            <div className="text-xs text-primary">
                              {Math.round(
                                ((challengesByCategory["web"]?.filter((c) => c.solved).length || 0) /
                                  (challengesByCategory["web"]?.length || 1)) *
                                  100,
                              )}
                              %
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-800/50 border border-primary/20 rounded-lg p-4">
                          <div className="text-xs text-muted-foreground mb-1">Crypto</div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-green-400" />
                              <span className="text-white font-medium">
                                {challengesByCategory["crypto"]?.filter((c) => c.solved).length || 0} / {challengesByCategory["crypto"]?.length || 0}
                              </span>
                            </div>
                            <div className="text-xs text-primary">
                              {Math.round(
                                ((challengesByCategory["crypto"]?.filter((c) => c.solved).length || 0) /
                                  (challengesByCategory["crypto"]?.length || 1)) *
                                  100,
                              )}
                              %
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-800/50 border border-primary/20 rounded-lg p-4">
                          <div className="text-xs text-muted-foreground mb-1">Forensics</div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Zap className="h-4 w-4 text-yellow-400" />
                              <span className="text-white font-medium">
                                {challengesByCategory["forensics"]?.filter((c) => c.solved).length || 0} / {challengesByCategory["forensics"]?.length || 0}
                              </span>
                            </div>
                            <div className="text-xs text-primary">
                              {Math.round(
                                ((challengesByCategory["forensics"]?.filter((c) => c.solved).length || 0) /
                                  (challengesByCategory["forensics"]?.length || 1)) *
                                  100,
                              )}
                              %
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-800/50 border border-primary/20 rounded-lg p-4">
                          <div className="text-xs text-muted-foreground mb-1">Pwn</div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Terminal className="h-4 w-4 text-red-400" />
                              <span className="text-white font-medium">
                                {challengesByCategory["pwn"]?.filter((c) => c.solved).length || 0} / {challengesByCategory["pwn"]?.length || 0}
                              </span>
                            </div>
                            <div className="text-xs text-primary">
                              {Math.round(
                                ((challengesByCategory["pwn"]?.filter((c) => c.solved).length || 0) /
                                  (challengesByCategory["pwn"]?.length || 1)) *
                                  100,
                              )}
                              %
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-800/50 border border-primary/20 rounded-lg p-4">
                          <div className="text-xs text-muted-foreground mb-1">Reverse</div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-purple-400" />
                              <span className="text-white font-medium">
                                {challengesByCategory["reverse"]?.filter((c) => c.solved).length || 0} / {challengesByCategory["reverse"]?.length || 0}
                              </span>
                            </div>
                            <div className="text-xs text-primary">
                              {Math.round(
                                ((challengesByCategory["reverse"]?.filter((c) => c.solved).length || 0) /
                                  (challengesByCategory["reverse"]?.length || 1)) *
                                  100,
                              )}
                              %
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-800/50 border border-primary/20 rounded-lg p-4">
                          <div className="text-xs text-muted-foreground mb-1">OSINT</div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Search className="h-4 w-4 text-orange-400" />
                              <span className="text-white font-medium">
                                {challengesByCategory["osint"]?.filter((c) => c.solved).length || 0} / {challengesByCategory["osint"]?.length || 0}
                              </span>
                            </div>
                            <div className="text-xs text-primary">
                              {Math.round(
                                ((challengesByCategory["osint"]?.filter((c) => c.solved).length || 0) /
                                  (challengesByCategory["osint"]?.length || 1)) *
                                  100,
                              )}
                              %
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
