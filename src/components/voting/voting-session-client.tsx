"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  ThumbsUp,
  MapPin,
  ExternalLink,
  Trash2,
  Lock,
  Unlock,
  Trophy,
} from "lucide-react"
import { toggleVote, removeSuggestion, closeVotingSession, reopenVotingSession } from "@/lib/actions/voting-actions"
import { PlaceSearch } from "./place-search"

interface VotingSessionData {
  id: string
  title: string
  description: string | null
  status: "OPEN" | "CLOSED"
  city: string | null
  createdById: string
  suggestions: {
    id: string
    name: string
    address: string | null
    city: string | null
    country: string | null
    category: string | null
    latitude: string | null
    longitude: string | null
    website: string | null
    note: string | null
    suggestedBy: { id: string; name: string | null }
    votes: {
      id: string
      user: { id: string; name: string | null }
    }[]
  }[]
}

interface Props {
  session: VotingSessionData
  tourId: string
  currentUserId: string
}

export function VotingSessionClient({ session, tourId, currentUserId }: Props) {
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null)
  const isOpen = session.status === "OPEN"
  const isCreator = session.createdById === currentUserId

  // Sort suggestions by vote count (descending)
  const sortedSuggestions = [...session.suggestions].sort(
    (a, b) => b.votes.length - a.votes.length
  )

  const maxVotes = sortedSuggestions.length > 0 ? sortedSuggestions[0].votes.length : 0

  async function handleVote(suggestionId: string) {
    setIsSubmitting(suggestionId)
    try {
      await toggleVote(suggestionId, tourId, session.id)
    } finally {
      setIsSubmitting(null)
    }
  }

  async function handleRemove(suggestionId: string) {
    if (!confirm("Vorschlag wirklich entfernen?")) return
    await removeSuggestion(suggestionId, tourId, session.id)
  }

  async function handleToggleStatus() {
    if (isOpen) {
      await closeVotingSession(session.id, tourId)
    } else {
      await reopenVotingSession(session.id, tourId)
    }
  }

  return (
    <div className="space-y-6">
      {/* Admin controls */}
      {isCreator && (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleToggleStatus}>
            {isOpen ? (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Abstimmung beenden
              </>
            ) : (
              <>
                <Unlock className="mr-2 h-4 w-4" />
                Wieder offnen
              </>
            )}
          </Button>
        </div>
      )}

      {/* Add suggestion */}
      {isOpen && (
        <PlaceSearch
          sessionId={session.id}
          tourId={tourId}
          defaultCity={session.city ?? undefined}
        />
      )}

      {/* Suggestions list */}
      {sortedSuggestions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Noch keine Vorschlage. Suche nach einem Ort und schlage ihn vor!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedSuggestions.map((suggestion, index) => {
            const hasVoted = suggestion.votes.some((v) => v.user.id === currentUserId)
            const isWinner = !isOpen && suggestion.votes.length === maxVotes && maxVotes > 0
            const canRemove =
              suggestion.suggestedBy.id === currentUserId || isCreator

            return (
              <Card
                key={suggestion.id}
                className={
                  isWinner
                    ? "border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20"
                    : ""
                }
              >
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    {/* Vote button */}
                    <div className="flex flex-col items-center gap-1 min-w-[60px]">
                      <Button
                        variant={hasVoted ? "default" : "outline"}
                        size="sm"
                        className="h-10 w-10 rounded-full p-0"
                        disabled={!isOpen || isSubmitting === suggestion.id}
                        onClick={() => handleVote(suggestion.id)}
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-bold">
                        {suggestion.votes.length}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {isWinner && (
                          <Trophy className="h-4 w-4 text-yellow-600" />
                        )}
                        <h3 className="font-semibold text-lg">
                          {index + 1}. {suggestion.name}
                        </h3>
                        {suggestion.category && (
                          <Badge variant="secondary" className="text-xs">
                            {suggestion.category}
                          </Badge>
                        )}
                      </div>

                      {(suggestion.address || suggestion.city) && (
                        <p className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {[suggestion.address, suggestion.city, suggestion.country]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}

                      {suggestion.note && (
                        <p className="text-sm text-muted-foreground italic">
                          &ldquo;{suggestion.note}&rdquo;
                        </p>
                      )}

                      <div className="flex items-center gap-3 pt-1 flex-wrap">
                        {suggestion.website && (
                          <a
                            href={suggestion.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Website
                          </a>
                        )}

                        {suggestion.latitude && suggestion.longitude && (
                          <a
                            href={`https://www.openstreetmap.org/?mlat=${suggestion.latitude}&mlon=${suggestion.longitude}#map=18/${suggestion.latitude}/${suggestion.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <MapPin className="h-3 w-3" />
                            Karte
                          </a>
                        )}
                      </div>

                      {/* Voters */}
                      {suggestion.votes.length > 0 && (
                        <div className="flex items-center gap-1 pt-2">
                          {suggestion.votes.map((vote) => (
                            <Avatar key={vote.id} className="h-6 w-6">
                              <AvatarFallback className="text-[10px]">
                                {vote.user.name
                                  ? vote.user.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .toUpperCase()
                                      .slice(0, 2)
                                  : "?"}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          <span className="text-xs text-muted-foreground ml-1">
                            {suggestion.votes.map((v) => v.user.name).join(", ")}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Meta & actions */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="text-xs text-muted-foreground">
                        von {suggestion.suggestedBy.name ?? "Unbekannt"}
                      </span>
                      {canRemove && isOpen && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemove(suggestion.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
