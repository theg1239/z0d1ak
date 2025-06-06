import { SiteHeader } from "@/components/site-header"
import { getLatestCompetitions } from "@/app/actions/getLatestTags"
import { notFound } from "next/navigation"
import dynamic from "next/dynamic"
import { getPostsByTag } from "@/app/actions/getPostsByTag"

const ChallengeUniverse = dynamic(() => import('./challenge-universe'))

async function getCompetition(name: string) {
  const competitions = await getLatestCompetitions(100)
  const competition = competitions.find(comp => comp.name === name)
  if (!competition) {
    return null
  }

  const writeups = await getPostsByTag(competition.id)

  const challenges = writeups.map((post, i) => {
    let category = post.categoryName ? post.categoryName.toLowerCase() : 'misc';
    const difficulty = 'medium';
    
   // console.log(`Post "${post.title}" - categoryName: "${post.categoryName}" -> category: "${category}"`);
    
    return {
      id: post.id,
      name: post.title,
      category,
      difficulty,
      points: 0,
      solved: true,
      description: post.excerpt || post.slug,
      slug: post.slug,
    }
  })

  //console.log("Final challenges array:", challenges);

  return {
    ...competition,
    challenges,
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    website: "https://ctftime.org",
    teamSize: Math.floor(Math.random() * 5) + 3,
    totalPoints: challenges.length,
    earnedPoints: challenges.length,
  }
}

export default async function CompetitionPage(props: { params: Promise<{ name: string }> }) {
  const { name } = await props.params
  const competition = await getCompetition(name)

  if (!competition) {
    notFound()
  }

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        margin: 0,
        padding: 0,
        overflow: "hidden",
        position: "relative",
        background: "black",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 100,
        }}
      >
        <SiteHeader />
      </div>

      <ChallengeUniverse competition={competition} />
    </div>
  )
}
