'use client'

import React, { useState } from 'react'
import { Search, AlertCircle, XCircle, Copy, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SearchResult {
  id: number;
  filename: string;
  file_size: number;
  guid: string;
  short_guid: string;
  type: string;
  width?: number;
  height?: number;
  description?: string | null;
  thumb_url: string;
  tags: Array<{
    name: string;
    sub_type: string;
  }>;
  created_at: string;
  updated_at: string;
}

interface SearchResponse {
  total_entries: number;
  assets: SearchResult[];
}

interface AuthDetails {
  token: string;
  organizationId: string;
}

export default function LandingPage() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [totalEntries, setTotalEntries] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedGuid, setCopiedGuid] = useState<string | null>(null)
  const [lastSearchQuery, setLastSearchQuery] = useState<string>('')
  const [auth, setAuth] = useState<AuthDetails | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mediagraph_auth')
      return saved ? JSON.parse(saved) : null
    }
    return null
  })

  const handleAuthSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const token = formData.get('token')?.toString()
    const organizationId = formData.get('organizationId')?.toString()
    
    if (token && organizationId) {
      const authDetails = { token, organizationId }
      setAuth(authDetails)
      localStorage.setItem('mediagraph_auth', JSON.stringify(authDetails))
    }
  }

  const handleSearch = async (e: React.FormEvent<HTMLFormElement> | null, page?: number) => {
    if (e) {
      e.preventDefault()
    }
    
    const searchQuery = e ? new FormData(e.currentTarget as HTMLFormElement).get('q')?.toString() : lastSearchQuery

    if (!searchQuery) return
    if (!auth) {
      setError('Please enter your authentication details first')
      return
    }

    setIsLoading(true)
    setError(null)
    
    if (e) {
      setLastSearchQuery(searchQuery)
      setCurrentPage(1)
    }

    const targetPage = page || 1

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_MEDIAGRAPH_API_URL}/assets/search?q=${encodeURIComponent(searchQuery)}&page=${targetPage}&per_page=25`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Basic ${btoa(':' + auth.token)}`,
          'OrganizationId': auth.organizationId
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          setAuth(null)
          localStorage.removeItem('mediagraph_auth')
          throw new Error('Invalid authentication. Please check your credentials.')
        }
        throw new Error(`Search failed: ${response.statusText}`)
      }

      const data = await response.json() as SearchResponse
      console.log('Search response:', data)
      
      if (data.assets && Array.isArray(data.assets)) {
        setSearchResults(data.assets)
        setTotalEntries(data.total_entries)
        setCurrentPage(targetPage)
      } else {
        console.error('Unexpected response format:', data)
        throw new Error('Unexpected response format from the API')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while searching')
    } finally {
      setIsLoading(false)
    }
  }

  if (!auth) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-xl font-bold">Mediagraph Search</h1>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center">
          <div className="max-w-md w-full px-4">
            <h2 className="text-2xl font-bold mb-6 text-center">Enter Your Credentials</h2>
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label htmlFor="token" className="block text-sm font-medium mb-1">
                  Personal Access Token
                </label>
                <Input
                  id="token"
                  type="password"
                  name="token"
                  placeholder="Enter your Personal Access Token"
                  required
                />
              </div>
              <div>
                <label htmlFor="organizationId" className="block text-sm font-medium mb-1">
                  Organization ID
                </label>
                <Input
                  id="organizationId"
                  type="text"
                  name="organizationId"
                  placeholder="Enter your Organization ID"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Save Credentials
              </Button>
            </form>
          </div>
        </main>

        <footer className="border-t py-6">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Gus Baganz. All rights reserved.</p>
          </div>
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">Mediagraph Search</h1>
          </div>
          <nav>
            <Button
              variant="ghost"
              onClick={() => {
                setAuth(null)
                localStorage.removeItem('mediagraph_auth')
              }}
              className="px-4 py-2 rounded-md hover:bg-muted transition-colors"
            >
              Change Credentials
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Search your Mediagraph account</h2>
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
              Enter a search term below to see all matching assets.
            </p>

            <div className="max-w-md mx-auto">
              <form onSubmit={handleSearch} className="flex w-full max-w-md items-center space-x-2">
                <Input 
                  type="text" 
                  name="q" 
                  placeholder="Search for anything..." 
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading}>
                  <Search className="h-4 w-4 mr-2" />
                  {isLoading ? 'Searching...' : 'Search'}
                </Button>
              </form>

              {error && (
                <div className="mt-4 p-4 border border-red-200 bg-red-50 text-red-700 rounded-lg flex items-start">
                  <XCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Search Error</p>
                    <p className="text-sm mt-1">{error}</p>
                    <p className="text-sm mt-2">
                      {error.includes('authentication') ? (
                        'Please check your Personal Access Token and Organization ID.'
                      ) : (
                        'Try refining your search term or try again later.'
                      )}
                    </p>
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="mt-8 text-center text-muted-foreground">
                  <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full" />
                  <p className="mt-2">Searching Mediagraph assets...</p>
                </div>
              )}

              {searchResults.length === 0 && !isLoading && !error && (
                <div className="mt-8 p-6 border border-muted bg-muted/5 rounded-lg text-center">
                  <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 font-medium">No results found</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Try adjusting your search term. You can search by:
                    <ul className="mt-2 space-y-1">
                      <li>• Asset name</li>
                      <li>• GUID</li>
                      <li>• File type</li>
                      <li>• Metadata content</li>
                    </ul>
                  </p>
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="mt-8 text-left">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Search Results</h3>
                    <span className="text-sm text-muted-foreground px-2 py-1 bg-muted/10 rounded">
                      Showing {((currentPage - 1) * 25) + 1}-{Math.min(currentPage * 25, totalEntries)} of {totalEntries} results
                    </span>
                  </div>
                  <div className="space-y-4">
                    {searchResults.map((result) => (
                      <div key={result.guid} className="p-4 border rounded-lg bg-white shadow-sm">
                        <div className="flex items-start gap-4">
                          <img 
                            src={result.thumb_url} 
                            alt={result.filename}
                            className="w-20 h-20 object-cover rounded-md"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{result.filename}</h4>
                                <p className="text-sm text-muted-foreground mt-1">{result.type}</p>
                                {result.tags && result.tags.length > 0 && (
                                  <div className="flex gap-2 mt-2 flex-wrap">
                                    {result.tags.map(tag => (
                                      <span key={tag.name} className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                                        {tag.name}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  {result.guid}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={async () => {
                                    await navigator.clipboard.writeText(result.guid)
                                    setCopiedGuid(result.guid)
                                    setTimeout(() => setCopiedGuid(null), 2000)
                                  }}
                                  title="Copy GUID"
                                >
                                  {copiedGuid === result.guid ? 
                                    <CheckCircle2 className="h-4 w-4 text-green-600" /> : 
                                    <Copy className="h-4 w-4" />
                                  }
                                </Button>
                              </div>
                            </div>
                            
                            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                              {result.file_size && (
                                <div>
                                  <span className="text-muted-foreground">Size:</span>{' '}
                                  {Math.round(result.file_size / 1024 / 1024)}MB
                                </div>
                              )}
                              {(result.width && result.height) && (
                                <div>
                                  <span className="text-muted-foreground">Resolution:</span>{' '}
                                  {result.width}×{result.height}
                                </div>
                              )}
                            </div>
                            
                            <div className="mt-3 text-xs text-muted-foreground">
                              <span>Created: {new Date(result.created_at).toLocaleDateString()}</span>
                              <span className="mx-2">•</span>
                              <span>Updated: {new Date(result.updated_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {totalEntries > 25 && (
                    <div className="mt-6 flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSearch(null, Math.max(1, currentPage - 1))}
                        disabled={isLoading || currentPage === 1}
                      >
                        Previous
                      </Button>
                      <span className="px-3 py-1 text-sm">
                        Page {currentPage} of {Math.ceil(totalEntries / 25)}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSearch(null, Math.min(Math.ceil(totalEntries / 25), currentPage + 1))}
                        disabled={isLoading || currentPage === Math.ceil(totalEntries / 25)}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Gus Baganz. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
