"use client"

import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { ArrowRight, Clock, Star, Film } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"

export default function HomePage() {
  const [movies, setMovies] = useState<any[]>([])  

  useEffect(() => {
    fetch("http://localhost:8000/user/movies/get_movies.php")  // 
      .then((r) => r.json())
      .then((d) => setMovies(d))
  }, [])

  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const heroImages = movies.slice(0, 5).map((movie) => movie.image)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [heroImages.length])

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 lg:px-8 overflow-hidden">
        {/* Background carousel */}
        <div className="absolute inset-0 z-0">
          {heroImages.map((image: any, index: number) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentImageIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={image || "/placeholder.svg"}
                alt={`Hero background ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/70 to-background" />
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-balance mb-6">
              Trải nghiệm điện ảnh đỉnh cao
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground text-balance mb-8 leading-relaxed">
              Đặt vé xem phim nhanh chóng, tiện lợi với CineMax. Hàng trăm bộ phim bom tấn đang chờ bạn khám phá.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-base">
                <Link href="/movies">
                  Các phim đang chiếu
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base bg-transparent">
                <Link href="/showtimes">Đặt vé</Link>
              </Button>
            </div>
          </div>

          {/* Carousel indicators */}
          <div className="flex justify-center gap-2 mt-12">
            {heroImages.map((_: any, index: number) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentImageIndex ? "w-8 bg-foreground" : "w-1.5 bg-foreground/30"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Movies */}
      <section className="py-20 px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Phim đang chiếu</h2>
              <p className="text-muted-foreground">Những bộ phim hot nhất hiện nay</p>
            </div>
            <Button variant="ghost" asChild className="hidden md:inline-flex">
              <Link href="/movies">
                Xem tất cả
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {movies.slice(0, 4).map((movie: any) => (
              <Link href={`/booking?movie=${movie.id}`} key={movie.id}>
                <div className="group overflow-hidden border border-border/50 hover:border-border transition-all duration-300 cursor-pointer rounded-xl shadow-sm bg-background">
                  <div className="aspect-[2/3] relative overflow-hidden bg-muted">
                    <img
                      src={movie.image || "/placeholder.svg"}
                      alt={movie.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge variant={movie.is_now_showing ? "default" : "secondary"} className="text-xs">
                        {movie.is_now_showing ? "Đang công chiếu" : "Sắp công chiếu"}
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      <span className="text-xs font-semibold">{movie.rating}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                      {movie.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">{movie.genre.join(", ")}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{movie.duration}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ... phần sau giữ nguyên y chang ... */}
    </div>
  )
}
