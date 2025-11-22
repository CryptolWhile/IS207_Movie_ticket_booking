"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Clock, Star, Search, Filter } from "lucide-react"
import Link from "next/link"

export default function MoviesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGenre, setSelectedGenre] = useState("Tất cả")
  const [genres, setGenres] = useState<string[]>(["Tất cả"])
  const [movies, setMovies] = useState<any[]>([])

  useEffect(() => {
    fetch("http://localhost:8000/user/movies/movies_list.php")
      .then(res => res.json())
      .then(data => setMovies(data))

    fetch("http://localhost:8000/user/movies/genres_list.php")
      .then(res => res.json())
      .then(data => setGenres(["Tất cả", ...data]))
  }, [])


  const filteredMovies = movies.filter((movie) => {
    const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesGenre = selectedGenre === "Tất cả" || movie.genre.includes(selectedGenre)
    return matchesSearch && matchesGenre
  })

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-20 px-6 lg:px-8">
        <div className="container mx-auto">
          
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Phim đang chiếu</h1>
            <p className="text-lg text-muted-foreground">Khám phá những bộ phim hot nhất hiện nay</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-12">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm phim..."
                className="pl-10 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="md:w-auto bg-transparent">
              <Filter className="mr-2 h-4 w-4" />
              Bộ lọc
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 mb-12">
            {genres.map((genre) => (
              <Badge
                key={genre}
                variant={selectedGenre === genre ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => setSelectedGenre(genre)}
              >
                {genre}
              </Badge>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredMovies.length > 0 ? (
              filteredMovies.map((movie) => (
                <Link href={`/booking?movie=${movie.movie_id}`} key={movie.movie_id}>
                  <div className="group overflow-hidden border border-border/50 hover:border-border transition-all duration-300 cursor-pointer h-full rounded-xl shadow-sm bg-background">
                    <div className="aspect-[2/3] relative overflow-hidden bg-muted">
                      <img
                        src={movie.poster || "/placeholder.svg"}
                        alt={movie.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                        <span className="text-xs font-semibold">{movie.rating}</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-1">
                        {movie.title}
                      </h3>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {movie.genre.map((g: string) => (
                          <Badge key={g} variant="secondary" className="text-xs">
                            {g}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{movie.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{movie.duration} phút</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground text-lg">Không tìm thấy phim phù hợp</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
