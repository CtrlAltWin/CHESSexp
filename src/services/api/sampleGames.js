/**
 * High-quality curated sample games for instant exploration and offline testing.
 * Includes classic games with diverse openings (Sicilian, Italian, Ruy Lopez, Queen's Gambit, King's Indian, etc.).
 */
export const SAMPLE_PROFILES = [
  {
    username: 'hikaru',
    displayName: 'Hikaru Nakamura',
    avatar: 'https://images.chesscomfiles.com/uploads/v1/user/15448422.5d382f64.200x200o.b9d14619bbbf.jpeg',
    title: 'GM'
  },
  {
    username: 'magnuscarlsen',
    displayName: 'Magnus Carlsen',
    avatar: 'https://images.chesscomfiles.com/uploads/v1/user/3889224.7ee3f260.200x200o.e3bf0eb2e82f.jpeg',
    title: 'GM'
  },
  {
    username: 'danielnaroditsky',
    displayName: 'Daniel Naroditsky',
    avatar: 'https://images.chesscomfiles.com/uploads/v1/user/14238714.288f619e.200x200o.089f2a4bf6b1.jpeg',
    title: 'GM'
  }
];

export const SAMPLE_GAMES = [
  // 1. Sicilian Defense: Najdorf
  {
    url: "https://www.chess.com/game/live/101",
    end_time: 1704110000,
    time_control: "180+2",
    time_class: "blitz",
    rated: true,
    white: { username: "hikaru", rating: 3220, result: "win" },
    black: { username: "magnuscarlsen", rating: 3205, result: "resigned" },
    pgn: `[Event "Live Chess"]
[Site "Chess.com"]
[Date "2024.01.01"]
[White "hikaru"]
[Black "magnuscarlsen"]
[Result "1-0"]
[WhiteElo "3220"]
[BlackElo "3205"]
[TimeControl "180+2"]

1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Bg5 e6 7. f4 Qb6 8. Qd2 Qxb2 9. Rb1 Qa3 10. f5 Nc6 11. fxe6 fxe6 12. Nxc6 bxc6 13. e5 dxe5 14. Bxf6 gxf6 15. Ne4 Be7 16. Be2 h5 17. Rb3 Qa4 18. c4 c5 19. O-O f5 20. Nd6+ Bxd6 21. Qxd6 Qd7 22. Qxe5 Qd4+ 23. Qxd4 cxd4 24. Bf3 Ra7 25. Re1 Ke7 26. c5 Rd8 27. c6 d3 28. Rd1 d2 29. Rb2 e5 30. Rbxd2 Rxd2 31. Rxd2 h4 32. Kf2 e4 33. Be2 Rc7 34. Rc2 Kd6 35. Ke3 Rxc6 36. Rxc6+ Kxc6 37. Kf4 Kd5 38. g3 hxg3 39. Kxg3 Ke5 40. h4 f4+ 1-0`
  },
  // 2. Sicilian Defense: Dragon
  {
    url: "https://www.chess.com/game/live/102",
    end_time: 1704200000,
    time_control: "180+2",
    time_class: "blitz",
    rated: true,
    white: { username: "hikaru", rating: 3225, result: "win" },
    black: { username: "firouzja2003", rating: 3180, result: "checkmated" },
    pgn: `[Event "Live Chess"]
[Site "Chess.com"]
[Date "2024.01.02"]
[White "hikaru"]
[Black "firouzja2003"]
[Result "1-0"]
[WhiteElo "3225"]
[BlackElo "3180"]
[TimeControl "180+2"]

1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 g6 6. Be3 Bg7 7. f3 O-O 8. Qd2 Nc6 9. Bc4 Bd7 10. O-O-O Rc8 11. Bb3 Ne5 12. h4 h5 13. Bg5 Rc5 14. Kb1 b5 15. g4 a5 16. gxh5 Nxh5 17. Nd5 Re8 18. Rhg1 a4 19. Nf4 Nxf4 20. Qxf4 axb3 21. cxb3 Qa5 22. h5 Ra8 23. a3 b4 24. hxg6 Nxg6 25. Qh2 bxa3 26. Bxe7 axb2 27. Qxb2 Rh5 28. Bxd6 Qb6 29. e5 Nxe5 30. Rxg7+ Kxg7 31. Bxe5+ Rxe5 32. f4 Rd5 33. Nf5+ Kg6 34. Qg7+ Kxf5 35. Qg5+ Ke6 36. Qxd5+ 1-0`
  },
  // 3. Ruy Lopez: Berlin Defense
  {
    url: "https://www.chess.com/game/live/103",
    end_time: 1704290000,
    time_control: "180+2",
    time_class: "blitz",
    rated: true,
    white: { username: "hikaru", rating: 3230, result: "win" },
    black: { username: "caruana", rating: 3195, result: "resigned" },
    pgn: `[Event "Live Chess"]
[Site "Chess.com"]
[Date "2024.01.03"]
[White "hikaru"]
[Black "caruana"]
[Result "1-0"]
[WhiteElo "3230"]
[BlackElo "3195"]
[TimeControl "180+2"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 Nf6 4. O-O Nxe4 5. d4 Nd6 6. Bxc6 dxc6 7. dxe5 Nf5 8. Qxd8+ Kxd8 9. Nc3 h6 10. h3 Ke8 11. b3 Be6 12. Bb2 Rd8 13. Rad1 Be7 14. Ne2 c5 15. c4 a5 16. Nf4 a4 17. Nd5 Rd7 18. g4 Nh4 19. Nxh4 Bxh4 20. f4 axb3 21. axb3 c6 22. Nb6 Rxd1 23. Rxd1 f5 24. exf6 Bxf6 25. Bxf6 gxf6 26. Kf2 Ke7 27. f5 Bc8 28. Kg3 h5 29. Kf4 hxg4 30. hxg4 Rd8 31. Rxd8 Kxd8 32. g5 fxg5+ 33. Kxg5 Bd7 34. Nxd7 Kxd7 35. Kg6 1-0`
  },
  // 4. Italian Game
  {
    url: "https://www.chess.com/game/live/104",
    end_time: 1704380000,
    time_control: "180+2",
    time_class: "blitz",
    rated: true,
    white: { username: "so_wesley", rating: 3150, result: "resigned" },
    black: { username: "hikaru", rating: 3235, result: "win" },
    pgn: `[Event "Live Chess"]
[Site "Chess.com"]
[Date "2024.01.04"]
[White "so_wesley"]
[Black "hikaru"]
[Result "0-1"]
[WhiteElo "3150"]
[BlackElo "3235"]
[TimeControl "180+2"]

1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d3 d6 6. O-O a5 7. Re1 O-O 8. h3 h6 9. Nbd2 Be6 10. Bb5 Qb8 11. Nf1 Qa7 12. Be3 Bxe3 13. Nxe3 Ne7 14. Bc4 Ng6 15. Bxe6 fxe6 16. g3 a4 17. Kg2 Rf7 18. Rf1 Raf8 19. Nd2 d5 20. Qe2 Qa6 21. c4 c6 22. Rac1 Qa7 23. Ng4 Nxg4 24. hxg4 Qb6 25. Rc2 Qd8 26. f3 Qg5 27. Rh1 Qe7 28. Qe3 Rd8 29. Rh5 Qf8 30. Rc1 Rfd7 31. exd5 exd5 32. c5 Rf7 33. Rf1 Qe7 34. Rf2 Rdf8 35. Rh1 Qe6 36. Rh5 Qd7 37. b4 axb3 38. axb3 Re8 39. b4 Qc8 40. Rh1 Qa8 41. d4 exd4 42. Qxd4 Rfe7 43. Ra1 Qc8 44. Nb3 Re3 45. Qd1 Ne5 46. Nd4 Nd3 47. Re2 Rxe2+ 48. Nxe2 Nxb4 49. Nd4 Na6 50. Rc1 Qd8 51. Qd2 Qe7 52. Nf5 Qe2+ 53. Qxe2 Rxe2+ 54. Kf1 Rb2 0-1`
  },
  // 5. Queen's Gambit Declined
  {
    url: "https://www.chess.com/game/live/105",
    end_time: 1704470000,
    time_control: "180+2",
    time_class: "blitz",
    rated: true,
    white: { username: "hikaru", rating: 3240, result: "win" },
    black: { username: "arjun_erigaisi", rating: 3120, result: "resigned" },
    pgn: `[Event "Live Chess"]
[Site "Chess.com"]
[Date "2024.01.05"]
[White "hikaru"]
[Black "arjun_erigaisi"]
[Result "1-0"]
[WhiteElo "3240"]
[BlackElo "3120"]
[TimeControl "180+2"]

1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. cxd5 exd5 5. Bg5 c6 6. e3 Be7 7. Bd3 Nbd7 8. Qc2 O-O 9. Nge2 Re8 10. O-O Nf8 11. f3 Be6 12. Rad1 Rc8 13. Kh1 a6 14. e4 dxe4 15. fxe4 Ng4 16. Bc1 Bg5 17. Nf4 Bxf4 18. Bxf4 Qxd4 19. Bxa6 Qb6 20. Be2 Ne3 21. Bxe3 Qxe3 22. Rf3 Qc5 23. Qd2 Ng6 24. Rd3 Ne5 25. Rd4 b5 26. a3 Bb3 27. Rc1 Qe7 28. Qf4 Rcd8 29. Rxd8 Rxd8 30. h3 h6 31. Qe3 Bc4 32. Rd1 Rxd1+ 33. Nxd1 Bxe2 34. Qxe2 Qd6 35. Nf2 Qd4 36. b3 g6 37. Ng4 Nxg4 38. Qxg4 Qa1+ 39. Kh2 Qxa3 40. Qc8+ Kg7 41. Qxc6 Qxb3 42. e5 Qc4 43. Qf6+ Kg8 44. Qd8+ Kh7 45. Qd6 b4 46. e6 Qxe6 47. Qxb4 Qe5+ 48. Kh1 h5 49. Qc4 Kg7 50. Qc6 g5 51. Qc1 h4 52. Qd1 Kg6 53. Qd8 Qe1+ 54. Kh2 Qe5+ 55. Kh1 f6 56. Qg8+ Kf5 57. Qc8+ Kf4 58. Qg4+ Ke3 59. Qf3+ Kd4 60. Qd1+ Kc5 61. Qc2+ Kd6 62. Qd3+ Ke6 63. Qg6 Qe1+ 64. Kh2 Qe5+ 65. Kh1 Ke7 66. Qg7+ Kd6 67. Qf8+ Qe7 68. Qb8+ Ke6 69. Qc8+ Kf7 70. Qf5 Kg7 71. Qd5 Qe5 72. Qd7+ Kg6 73. Qd8 f5 74. Qg8+ Kh6 75. Qf8+ Kg6 76. Qg8+ Kh6 77. Qf8+ Kh5 78. Qf7+ Kh6 79. Qf8+ 1-0`
  },
  // 6. King's Indian Defense
  {
    url: "https://www.chess.com/game/live/106",
    end_time: 1704560000,
    time_control: "180+2",
    time_class: "blitz",
    rated: true,
    white: { username: "ding_liren", rating: 3160, result: "resigned" },
    black: { username: "hikaru", rating: 3242, result: "win" },
    pgn: `[Event "Live Chess"]
[Site "Chess.com"]
[Date "2024.01.06"]
[White "ding_liren"]
[Black "hikaru"]
[Result "0-1"]
[WhiteElo "3160"]
[BlackElo "3242"]
[TimeControl "180+2"]

1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. O-O Nc6 8. d5 Ne7 9. b4 a5 10. Ba3 axb4 11. Bxb4 b6 12. a4 Ne8 13. Nd2 f5 14. a5 c5 15. dxc6 Nxc6 16. Ba3 Rxa5 17. Nb3 Ra7 18. Nb5 Rd7 19. exf5 gxf5 20. Qd5+ Rdf7 21. Bh5 Bb7 22. Bxf7+ Rxf7 23. Qd1 e4 24. Ra2 Ne5 25. Nxd6 Nxd6 26. Qxd6 Rd7 27. Qe6+ Kh8 28. Bb2 Re7 29. Qxf5 e3 30. fxe3 Qd6 31. Bd4 h6 32. Raf2 Qc6 33. Nd2 Rf7 34. Qh3 Rxf2 35. Rxf2 Qg6 36. Qf5 Qxf5 37. Rxf5 Nc6 38. Bxg7+ Kxg7 39. Rb5 0-1`
  },
  // 7. French Defense
  {
    url: "https://www.chess.com/game/live/107",
    end_time: 1704650000,
    time_control: "180+2",
    time_class: "blitz",
    rated: true,
    white: { username: "hikaru", rating: 3245, result: "win" },
    black: { username: "nepomniachtchi", rating: 3190, result: "checkmated" },
    pgn: `[Event "Live Chess"]
[Site "Chess.com"]
[Date "2024.01.07"]
[White "hikaru"]
[Black "nepomniachtchi"]
[Result "1-0"]
[WhiteElo "3245"]
[BlackElo "3190"]
[TimeControl "180+2"]

1. e4 e6 2. d4 d5 3. Nc3 Nf6 4. e5 Nfd7 5. f4 c5 6. Nf3 Nc6 7. Be3 Be7 8. Qd2 O-O 9. Be2 a6 10. O-O b5 11. a3 Bb7 12. Nd1 cxd4 13. Nxd4 Nxd4 14. Bxd4 Bc5 15. c3 Qb6 16. Ne3 a5 17. b4 Bxd4 18. cxd4 axb4 19. axb4 Ra4 20. Rab1 Rfa8 21. f5 Ra2 22. Rb2 Rxb2 23. Qxb2 exf5 24. Nxf5 Nxe5 25. Kh1 Nc4 26. Qc1 Re8 27. Qg5 g6 28. Nh6+ Kh8 29. Nxf7+ Kg8 30. Nh6+ Kh8 31. Qf4 Qe6 32. Bg4 Qe7 33. Nf7+ Kg8 34. Ng5 Bc8 35. Bxc8 Rxc8 36. Qg4 Re8 37. Qh4 Nd2 38. Rg1 Ne4 39. Nf3 Qxh4 0-1`
  },
  // 8. Caro-Kann Defense
  {
    url: "https://www.chess.com/game/live/108",
    end_time: 1704740000,
    time_control: "180+2",
    time_class: "blitz",
    rated: true,
    white: { username: "hikaru", rating: 3248, result: "win" },
    black: { username: "firouzja2003", rating: 3185, result: "resigned" },
    pgn: `[Event "Live Chess"]
[Site "Chess.com"]
[Date "2024.01.08"]
[White "hikaru"]
[Black "firouzja2003"]
[Result "1-0"]
[WhiteElo "3248"]
[BlackElo "3185"]
[TimeControl "180+2"]

1. e4 c6 2. d4 d5 3. e5 Bf5 4. Nf3 e6 5. Be2 c5 6. Be3 Qb6 7. Nc3 Nc6 8. O-O Qxb2 9. Qe1 cxd4 10. Bxd4 Nxd4 11. Nxd4 Bb4 12. Ndb5 Ba5 13. Rb1 Qxc2 14. Rc1 Qb2 15. Nd6+ Kf8 16. Nxf5 exf5 17. Qd1 Ne7 18. Nxd5 Rd8 19. Bf3 Qxe5 20. Rc5 Bb6 21. Rb5 g6 22. Qb3 Nxd5 23. Bxd5 Kg7 24. Bxb7 Qf6 25. Bf3 Rd2 26. Rd5 Rd8 27. Rxd8 Qxd8 28. g3 Qd4 29. Kh1 Rxf2 30. Rxf2 Qxf2 31. Qc3+ Bd4 1-0`
  },
  // 9. English Opening
  {
    url: "https://www.chess.com/game/live/109",
    end_time: 1704830000,
    time_control: "180+2",
    time_class: "blitz",
    rated: true,
    white: { username: "hikaru", rating: 3250, result: "win" },
    black: { username: "anand", rating: 3080, result: "resigned" },
    pgn: `[Event "Live Chess"]
[Site "Chess.com"]
[Date "2024.01.09"]
[White "hikaru"]
[Black "anand"]
[Result "1-0"]
[WhiteElo "3250"]
[BlackElo "3080"]
[TimeControl "180+2"]

1. c4 e5 2. Nc3 Nf6 3. Nf3 Nc6 4. g3 d5 5. cxd5 Nxd5 6. Bg2 Nb6 7. O-O Be7 8. a3 O-O 9. b4 Be6 10. Rb1 f6 11. d3 a5 12. b5 Nd4 13. Nd2 c6 14. e3 Nf5 15. bxc6 bxc6 16. Bxc6 Rc8 17. Be4 Rxc3 18. Bb2 Rc8 19. Qh5 g6 20. Qe2 Na4 21. Ba1 Nc3 22. Bxc3 Rxc3 23. a4 Bb4 24. Rfc1 Qc7 25. Qd1 Rc8 26. Nc4 Bxc4 27. dxc4 Rxc1 28. Rxc1 Nd6 29. Bd5+ Kg7 30. Qg4 f5 31. Qe2 e4 32. Qb2+ Kh6 33. Qe5 Nf7 34. Qf6 Ne5 35. Qh4+ Kg7 36. Kg2 Be7 37. Qf4 Nd3 1-0`
  },
  // 10. London System
  {
    url: "https://www.chess.com/game/live/110",
    end_time: 1704920000,
    time_control: "180+2",
    time_class: "blitz",
    rated: true,
    white: { username: "hikaru", rating: 3252, result: "win" },
    black: { username: "duda", rating: 3110, result: "resigned" },
    pgn: `[Event "Live Chess"]
[Site "Chess.com"]
[Date "2024.01.10"]
[White "hikaru"]
[Black "duda"]
[Result "1-0"]
[WhiteElo "3252"]
[BlackElo "3110"]
[TimeControl "180+2"]

1. d4 d5 2. Bf4 Nf6 3. e3 c5 4. Nf3 Nc6 5. Nbd2 cxd4 6. exd4 Bf5 7. Bb5 Qb6 8. c4 e6 9. Qa4 Be7 10. c5 Qd8 11. Ne5 O-O 12. Bxc6 bxc6 13. Nxc6 Qd7 14. Nxe7+ Qxe7 15. Bd6 Qb7 16. Bxf8 Qxb2 17. O-O Rxf8 18. Nf3 Ne4 19. Qxa7 Bg4 20. Rab1 Qc2 21. Rbc1 Qd3 22. Ne5 Qxd4 23. Nxg4 Nd2 24. Ne3 Nxf1 25. Rxf1 Rc8 26. Rc1 Qd2 27. Qa3 d4 28. Nf1 Qg5 29. c6 h5 30. c7 d3 31. Qc3 h4 32. h3 e5 33. Ne3 e4 34. Qc4 Qe5 35. a4 g6 36. Qc6 Kg7 37. Qc3 Qxc3 38. Rxc3 f5 39. Kf1 Kf6 40. Ke1 Ke5 41. Kd2 Kd4 42. a5 f4 43. Ng4 1-0`
  }
];

