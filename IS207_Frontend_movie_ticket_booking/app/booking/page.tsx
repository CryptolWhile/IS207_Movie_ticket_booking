import { Header } from "@/components/header"
import { BookingForm } from "@/components/booking-form"
import { Suspense } from "react"
import { getMovieById, movies } from "@/lib/movies-data"

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ movie?: string }>
}) {
  const params = await searchParams
  const movieId = params.movie ? Number.parseInt(params.movie) : 1
  const movie = getMovieById(movieId) || movies[0]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-20 px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Đặt vé xem phim</h1>
            <p className="text-lg text-muted-foreground">Chọn suất chiếu và ghế ngồi yêu thích của bạn</p>
          </div>

          <Suspense fallback={<div>Loading...</div>}>
            <BookingForm movie={movie} />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
