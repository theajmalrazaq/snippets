import React from "react"
import { useParams } from "wouter"
import { useQuery } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Snippet } from "fake-snippets-api/lib/db/schema"
import { Link } from "wouter"
import { Button } from "@/components/ui/button"
import { GitHubLogoIcon } from "@radix-ui/react-icons"

export const UserProfilePage = () => {
  const { username } = useParams()
  const axios = useAxios()

  const { data: userSnippets, isLoading } = useQuery<Snippet[]>(
    ["userSnippets", username],
    async () => {
      const response = await axios.get(`/snippets/list?owner_name=${username}`)
      return response.data.snippets
    },
  )

  return (
    <div>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{username}'s Profile</h1>
        <div className="mb-6">
          <a
            href={`https://github.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center"
          >
            <Button variant="outline">
              <GitHubLogoIcon className="mr-2" />
              View GitHub Profile
            </Button>
          </a>
        </div>
        <h2 className="text-2xl font-semibold mb-4">Snippets</h2>
        {isLoading ? (
          <div>Loading snippets...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userSnippets?.map((snippet) => (
              <Link
                key={snippet.snippet_id}
                href={`/${snippet.owner_name}/${snippet.unscoped_name}`}
              >
                <div className="border p-4 rounded-md hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold">
                    {snippet.unscoped_name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(snippet.created_at).toLocaleString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}