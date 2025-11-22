export interface Movie {
  id: number
  title: string
  genre: string[]
  rating: number
  duration: string
  description: string
  image: string
  trailer: string
  isNowShowing: boolean
}

export const movies: Movie[] = [
  {
    id: 1,
    title: "Godzilla: King of the Monsters",
    genre: ["Hành động", "Khoa học viễn tưởng"],
    rating: 8.5,
    duration: "132 phút",
    description:
      "Khi thế giới phải đối mặt với sự trỗi dậy của những quái vật khổng lồ cổ đại, Godzilla buộc phải bước ra khỏi bóng tối để khẳng định ngôi vương của mình. Trong cuộc chiến sinh tử, Godzilla đối đầu với King Ghidorah ba đầu, Mothra và Rodan, tạo nên một trận chiến hủy diệt quy mô toàn cầu. Bộ phim mang đến những màn đối đầu hoành tráng, kỹ xảo mãn nhãn và đặt ra câu hỏi: loài người có thật sự là bá chủ của Trái Đất hay chỉ là kẻ ngoài cuộc trong thế giới của những Titan?",
    image: "/Poster/godzilla.jpg",
    trailer: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    isNowShowing: true,
  },
  {
    id: 2,
    title: "Doraemon: Nobita and the Space Heroes",
    genre: ["Hoạt hình", "Phiêu lưu", "Gia đình"],
    rating: 8.2,
    duration: "100 phút",
    description:
      "Trong chuyến phiêu lưu đầy ắp tiếng cười, Nobita cùng Doraemon, Shizuka, Suneo và Jaian bất ngờ hóa thân thành những anh hùng không gian. Ban đầu chỉ là một trò chơi đóng giả, nhưng mọi chuyện trở nên nghiêm trọng khi họ phải đối đầu với kẻ xấu thực sự đe dọa đến hòa bình vũ trụ. Bộ phim đưa khán giả vào một hành trình kỳ thú xuyên thiên hà, vừa vui nhộn, vừa cảm động với tình bạn, lòng dũng cảm và khát khao trở thành anh hùng thật sự.",
    image: "/Poster/doraemonspaceheroes.jpg",
    trailer: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    isNowShowing: true,
  },
  {
    id: 3,
    title: "Doraemon: Nobita's Great Adventure in the Antarctic Kachi Kochi",
    genre: ["Hoạt hình", "Phiêu lưu", "Gia đình"],
    rating: 8.3,
    duration: "101 phút",
    description:
      "Một ngày nọ, Nobita và những người bạn quyết định dùng bảo bối của Doraemon để tới Nam Cực tránh nóng. Không ngờ rằng tại vùng đất băng giá, họ phát hiện ra một tảng băng bí ẩn chứa vật thể từ hàng chục ngàn năm trước. Từ đó, cả nhóm cuốn vào một cuộc phiêu lưu kỳ thú, đối mặt với hiểm nguy và khám phá bí mật của một nền văn minh đã biến mất. Bộ phim là sự kết hợp giữa tiếng cười, sự gay cấn và những khoảnh khắc cảm động về tình bạn và lòng dũng cảm.",
    image: "/Poster/doraemonkachikochi.jpg",
    trailer: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    isNowShowing: true,
  },
  {
    id: 4,
    title: "Doraemon: Nobita và những bạn khủng long mới",
    genre: ["Hoạt hình", "Phiêu lưu", "Gia đình"],
    rating: 8.4,
    duration: "110 phút",
    description:
      "Trong một lần tình cờ, Nobita phát hiện ra hai quả trứng kỳ lạ và nuôi dưỡng thành công hai chú khủng long con dễ thương. Khi khủng long lớn dần, Nobita và nhóm bạn quyết định đưa chúng trở về đúng thời đại của mình. Thế nhưng, chuyến hành trình không hề dễ dàng khi cả nhóm phải đối mặt với những kẻ săn khủng long và những thử thách đầy hiểm nguy. Đây là một câu chuyện xúc động về tình bạn, sự trưởng thành và lòng yêu thương thiên nhiên.",
    image: "/Poster/doreamontanchukhunglongcuanobita.jpg",
    trailer: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    isNowShowing: true,
  },
  {
    id: 5,
    title: "The Conjuring",
    genre: ["Kinh dị", "Bí ẩn"],
    rating: 8.7,
    duration: "112 phút",
    description:
      "Dựa trên hồ sơ có thật của cặp đôi trừ tà nổi tiếng Ed và Lorraine Warren, bộ phim kể về vụ án ám ảnh nhất trong sự nghiệp của họ. Một gia đình chuyển đến ngôi nhà mới ở Rhode Island và nhanh chóng bị quấy nhiễu bởi những hiện tượng siêu nhiên kinh hoàng. Khi bóng tối ngày càng bao trùm, Ed và Lorraine buộc phải đối mặt với một thế lực tà ác cổ xưa, mạnh mẽ hơn những gì họ từng gặp. Bộ phim mang đến bầu không khí rùng rợn, căng thẳng đến nghẹt thở từ đầu đến cuối.",
    image: "/Poster/theconjuring.jpg",
    trailer: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    isNowShowing: true,
  },
  {
    id: 6,
    title: "Tôi thấy hoa vàng trên cỏ xanh",
    genre: ["Tâm lý", "Gia đình"],
    rating: 9.0,
    duration: "110 phút",
    description:
      "Dựa trên tiểu thuyết nổi tiếng của nhà văn Nguyễn Nhật Ánh, bộ phim tái hiện tuổi thơ trong sáng của những đứa trẻ lớn lên tại một miền quê Việt Nam những năm 1980. Phim kể về tình cảm anh em giữa Thiều và Tường, những rung động đầu đời, những trò nghịch ngợm tuổi thơ, xen lẫn những bi kịch gia đình và xã hội. Hình ảnh đồng quê thơ mộng, âm nhạc trong trẻo cùng những cảm xúc chân thật đã biến bộ phim thành một bản tình ca dịu dàng về ký ức tuổi thơ.",
    image: "/Poster/toithayhoavangtrencoxanh.jpg",
    trailer: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    isNowShowing: false,
  },
  {
    id: 7,
    title: "Mưa Đỏ",
    genre: ["Chiến tranh", "Lịch sử", "Tâm lý"],
    rating: 8.9,
    duration: "135 phút",
    description:
      "Lấy bối cảnh những năm tháng ác liệt của cuộc kháng chiến, bộ phim tái hiện lại sự hy sinh oanh liệt của những người lính trên chiến trường. Với những trận đánh khốc liệt, máu và nước mắt hòa vào nhau như những cơn mưa đỏ, khán giả sẽ được chứng kiến tinh thần quả cảm, sự mất mát v�� khát vọng tự do mãnh liệt. Bộ phim không chỉ ca ngợi tinh thần anh hùng mà còn là bản hùng ca lay động trái tim về sự hy sinh thầm lặng.",
    image: "/Poster/muado.jpg",
    trailer: "https://www.youtube.com/embed/BD6PoZJdt_M?si=z4WvSRB5FDfLA8mZ",
    isNowShowing: false,
  },
  {
    id: 8,
    title: "La La Land",
    genre: ["Tình cảm", "Âm nhạc", "Tâm lý"],
    rating: 9.2,
    duration: "128 phút",
    description:
      "Một bản tình ca hiện đại rực rỡ sắc màu về tình yêu và ước mơ tại Los Angeles. Câu chuyện xoay quanh Sebastian, một nhạc công jazz đầy đam mê, và Mia, một nữ diễn viên trẻ khao khát thành công. Họ gặp nhau, yêu nhau, truyền cảm hứng cho nhau để theo đuổi ước mơ, nhưng cũng phải đối mặt với sự đánh đổi và thử thách từ cuộc sống thực tế. Với âm nhạc say đắm, vũ đạo tuyệt đẹp và những thước phim lãng mạn, La La Land là một tác phẩm chạm đến trái tim hàng triệu khán giả.",
    image: "/Poster/lalaland.jpg",
    trailer: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    isNowShowing: false,
  },
]

export function getMoviesByShowingStatus(isNowShowing: boolean): Movie[] {
  return movies.filter((movie) => movie.isNowShowing === isNowShowing)
}

export function getMovieById(id: number): Movie | undefined {
  return movies.find((movie) => movie.id === id)
}

export function getAllGenres(): string[] {
  const genresSet = new Set<string>()
  movies.forEach((movie) => {
    movie.genre.forEach((g) => genresSet.add(g))
  })
  return Array.from(genresSet).sort()
}
