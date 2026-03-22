export const PROBLEMS = [
  {
    id: 'two_sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    topic: ['Arrays & Strings', 'Hash Map'],
    description:
      'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nInput format:\n- Line 1: space-separated integers nums\n- Line 2: target\n\nOutput format:\n- Print indices as: `i j` (space-separated)',
    constraints: ['2 <= nums.length <= 10^4'],
    example: 'Input:\n2 7 11 15\n9\nOutput:\n0 1',
    testCases: [
      { stdin: '2 7 11 15\n9\n', expectedOutput: '0 1' },
      { stdin: '3 2 4\n6\n', expectedOutput: '1 2' },
      { stdin: '1 3 7 5 10 9\n12\n', expectedOutput: '1 4' },
    ],
  },
  {
    id: 'valid_parentheses',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    topic: ['Arrays & Strings', 'Stack'],
    description:
      'Given a string `s` containing only characters `()[]{}`, determine if the input string is valid.\n\nInput format:\n- Single line: string s\n\nOutput format:\n- Print `true` or `false`',
    constraints: ['1 <= s.length <= 10^4'],
    example: 'Input:\n()[]{}\nOutput:\ntrue',
    testCases: [
      { stdin: '()[]{}\n', expectedOutput: 'true' },
      { stdin: '([)]\n', expectedOutput: 'false' },
      { stdin: '(((())))\n', expectedOutput: 'true' },
    ],
  },
  {
    id: 'best_time_buy_sell_stock',
    title: 'Best Time to Buy and Sell Stock',
    difficulty: 'Easy',
    topic: ['Dynamic Programming'],
    description:
      'You are given an array `prices` where `prices[i]` is the price on day i. Return the maximum profit from one buy and one sell.\n\nInput format:\n- Line 1: space-separated prices\n\nOutput format:\n- Single integer: max profit',
    constraints: ['1 <= prices.length <= 10^5'],
    example: 'Input:\n7 1 5 3 6 4\nOutput:\n5',
    testCases: [
      { stdin: '7 1 5 3 6 4\n', expectedOutput: '5' },
      { stdin: '7 6 4 3 1\n', expectedOutput: '0' },
      { stdin: '1 2\n', expectedOutput: '1' },
    ],
  },
  {
    id: 'binary_search',
    title: 'Binary Search',
    difficulty: 'Easy',
    topic: ['Arrays & Strings', 'Binary Search'],
    description:
      'Given sorted array `nums` and `target`, return the index of target. Return -1 if not found.\n\nInput format:\n- Line 1: space-separated sorted integers\n- Line 2: target\n\nOutput format:\n- Index (integer)',
    constraints: ['1 <= nums.length <= 10^4'],
    example: 'Input:\n-1 0 3 5 9 12\n9\nOutput:\n4',
    testCases: [
      { stdin: '-1 0 3 5 9 12\n9\n', expectedOutput: '4' },
      { stdin: '-1 0 3 5 9 12\n2\n', expectedOutput: '-1' },
      { stdin: '5\n5\n', expectedOutput: '0' },
    ],
  },
  {
    id: 'climbing_stairs',
    title: 'Climbing Stairs',
    difficulty: 'Easy',
    topic: ['Dynamic Programming'],
    description:
      'You are climbing stairs. Each time you can climb 1 or 2 steps. How many distinct ways to reach the top (n steps)?\n\nInput format:\n- Single integer n\n\nOutput format:\n- Number of ways',
    constraints: ['1 <= n <= 45'],
    example: 'Input:\n3\nOutput:\n3',
    testCases: [
      { stdin: '2\n', expectedOutput: '2' },
      { stdin: '3\n', expectedOutput: '3' },
      { stdin: '4\n', expectedOutput: '5' },
    ],
  },
  {
    id: 'merge_two_sorted_lists',
    title: 'Merge Two Sorted Lists',
    difficulty: 'Easy',
    topic: ['Arrays & Strings', 'Linked List'],
    description:
      'Merge two sorted arrays into one sorted array.\n\nInput format:\n- Line 1: space-separated sorted array 1\n- Line 2: space-separated sorted array 2\n\nOutput format:\n- Space-separated merged sorted array',
    constraints: ['0 <= lengths <= 100'],
    example: 'Input:\n1 2 4\n1 3 4\nOutput:\n1 1 2 3 4 4',
    testCases: [
      { stdin: '1 2 4\n1 3 4\n', expectedOutput: '1 1 2 3 4 4' },
      { stdin: '\n0\n', expectedOutput: '0' },
      { stdin: '1 3 5\n2 4 6\n', expectedOutput: '1 2 3 4 5 6' },
    ],
  },
  {
    id: 'longest_substring_no_repeat',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    topic: ['Arrays & Strings', 'Sliding Window'],
    description:
      'Given a string `s`, find the length of the longest substring without repeating characters.\n\nInput format:\n- Single line: string s\n\nOutput format:\n- Length (integer)',
    constraints: ['0 <= s.length <= 5*10^4'],
    example: 'Input:\nabcabcbb\nOutput:\n3',
    testCases: [
      { stdin: 'abcabcbb\n', expectedOutput: '3' },
      { stdin: 'bbbbb\n', expectedOutput: '1' },
      { stdin: 'pwwkew\n', expectedOutput: '3' },
    ],
  },
  {
    id: 'group_anagrams',
    title: 'Group Anagrams',
    difficulty: 'Medium',
    topic: ['Arrays & Strings', 'Hash Map'],
    description:
      'Group strings that are anagrams. Output each group on a line, words space-separated. Groups in any order.\n\nInput format:\n- Line 1: space-separated strings\n\nOutput format:\n- Each group on a line (words space-separated)',
    constraints: ['1 <= strs.length <= 10^4'],
    example: 'Input:\neat tea tan ate nat bat\nOutput:\neat tea ate\ntan nat\nbat',
    testCases: [], // Output order varies
  },
  {
    id: 'top_k_frequent_elements',
    title: 'Top K Frequent Elements',
    difficulty: 'Medium',
    topic: ['Arrays & Strings', 'Heap'],
    description:
      'Given integer array `nums` and `k`, return the k most frequent elements. Order does not matter.\n\nInput format:\n- Line 1: space-separated nums\n- Line 2: k\n\nOutput format:\n- Space-separated top k elements (any order)',
    constraints: ['1 <= nums.length <= 10^5'],
    example: 'Input:\n1 1 1 2 2 3\n2\nOutput:\n1 2',
    testCases: [], // Output order can vary
  },
  {
    id: 'product_array_except_self',
    title: 'Product of Array Except Self',
    difficulty: 'Medium',
    topic: ['Arrays & Strings'],
    description:
      'Return array `output` where output[i] = product of all elements except nums[i]. Without division.\n\nInput format:\n- Space-separated integers\n\nOutput format:\n- Space-separated result array',
    constraints: ['2 <= nums.length <= 10^5'],
    example: 'Input:\n1 2 3 4\nOutput:\n24 12 8 6',
    testCases: [
      { stdin: '1 2 3 4\n', expectedOutput: '24 12 8 6' },
      { stdin: '-1 1 0 -3 3\n', expectedOutput: '0 0 9 0 0' },
    ],
  },
  {
    id: 'coin_change',
    title: 'Coin Change',
    difficulty: 'Medium',
    topic: ['Dynamic Programming'],
    description:
      'Given coins array and amount, return minimum number of coins to make amount. Return -1 if impossible.\n\nInput format:\n- Line 1: space-separated coins\n- Line 2: amount\n\nOutput format:\n- Min coins or -1',
    constraints: ['1 <= coins.length <= 12'],
    example: 'Input:\n1 2 5\n11\nOutput:\n3',
    testCases: [
      { stdin: '1 2 5\n11\n', expectedOutput: '3' },
      { stdin: '2\n3\n', expectedOutput: '-1' },
      { stdin: '1\n0\n', expectedOutput: '0' },
    ],
  },
  {
    id: 'subarray_sum_equals_k',
    title: 'Subarray Sum Equals K',
    difficulty: 'Medium',
    topic: ['Arrays & Strings', 'Prefix Sum'],
    description:
      'Count the number of subarrays with sum exactly equal to k.\n\nInput format:\n- Line 1: space-separated integers\n- Line 2: k\n\nOutput format:\n- Count (integer)',
    constraints: ['1 <= nums.length <= 2*10^4'],
    example: 'Input:\n1 1 1\n2\nOutput:\n2',
    testCases: [
      { stdin: '1 1 1\n2\n', expectedOutput: '2' },
      { stdin: '1 2 3\n3\n', expectedOutput: '2' },
    ],
  },
  {
    id: 'trapping_rain_water',
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    topic: ['Arrays & Strings', 'Two Pointers'],
    description:
      'Given elevation map (array of heights), compute how much rain water can be trapped.\n\nInput format:\n- Space-separated heights\n\nOutput format:\n- Total trapped water (integer)',
    constraints: ['n == height.length'],
    example: 'Input:\n0 1 0 2 1 0 1 3 2 1 2 1\nOutput:\n6',
    testCases: [
      { stdin: '0 1 0 2 1 0 1 3 2 1 2 1\n', expectedOutput: '6' },
      { stdin: '4 2 0 3 2 5\n', expectedOutput: '9' },
    ],
  },
  {
    id: 'number_of_islands',
    title: 'Number of Islands',
    difficulty: 'Medium',
    topic: ['Trees & Graphs', 'Graphs'],
    description:
      'Given 2D grid of 1 (land) and 0 (water), count the number of islands. Grid: first line rows cols, then rows lines of space-separated 0/1.\n\nInput format:\n- Line 1: rows cols\n- Next rows lines: space-separated 0/1\n\nOutput format:\n- Count',
    constraints: ['m,n <= 300'],
    example: 'Input:\n4 5\n1 1 1 1 0\n1 1 0 1 0\n1 1 0 0 0\n0 0 0 0 0\nOutput:\n1',
    testCases: [
      { stdin: '4 5\n1 1 1 1 0\n1 1 0 1 0\n1 1 0 0 0\n0 0 0 0 0\n', expectedOutput: '1' },
    ],
  },
  {
    id: 'kth_smallest_bst',
    title: 'Kth Smallest in BST',
    difficulty: 'Medium',
    topic: ['Trees & Graphs', 'Trees'],
    description:
      'Given BST as inorder array (sorted) and k, return kth smallest element (1-indexed).\n\nInput format:\n- Line 1: space-separated BST values (inorder)\n- Line 2: k\n\nOutput format:\n- Kth smallest value',
    constraints: ['1 <= k <= n'],
    example: 'Input:\n3 1 4 2\n1\nOutput:\n1',
    testCases: [
      { stdin: '1 2 3 4\n1\n', expectedOutput: '1' },
      { stdin: '5 3 6 2 4 1\n3\n', expectedOutput: '3' },
    ],
  },
  {
    id: 'word_ladder',
    title: 'Word Ladder',
    difficulty: 'Hard',
    topic: ['Trees & Graphs', 'BFS'],
    description:
      'Given beginWord, endWord, wordList. Return length of shortest transformation sequence (each step change one letter). Return 0 if impossible.\n\nInput format:\n- Line 1: beginWord endWord\n- Line 2: space-separated wordList\n\nOutput format:\n- Sequence length (including begin and end)',
    constraints: ['1 <= wordList.length <= 5000'],
    example: 'Input:\nhit cog\nhot dot dog lot log cog\nOutput:\n5',
    testCases: [
      { stdin: 'hit cog\nhot dot dog lot log cog\n', expectedOutput: '5' },
      { stdin: 'a c\na b c\n', expectedOutput: '3' },
    ],
  },
  {
    id: 'median_two_sorted_arrays',
    title: 'Median of Two Sorted Arrays',
    difficulty: 'Hard',
    topic: ['Arrays & Strings', 'Binary Search'],
    description:
      'Given two sorted arrays, find median of merged array. Output as decimal string if needed.\n\nInput format:\n- Line 1: space-separated sorted array 1\n- Line 2: space-separated sorted array 2\n\nOutput format:\n- Median value',
    constraints: ['m + n >= 1'],
    example: 'Input:\n1 3\n2\nOutput:\n2',
    testCases: [
      { stdin: '1 3\n2\n', expectedOutput: '2' },
      { stdin: '1 2\n3 4\n', expectedOutput: '2.5' },
    ],
  },
  {
    id: 'lru_cache',
    title: 'LRU Cache',
    difficulty: 'Medium',
    topic: ['System Design'],
    description:
      'Implement LRU cache. Input: capacity, then "put key value" or "get key" commands. Output get results.\n\nInput format:\n- Line 1: capacity\n- Lines 2+: put k v  or  get k\n\nOutput format:\n- For each get: value or -1',
    constraints: ['1 <= capacity <= 3000'],
    example: 'Input:\n2\nput 1 1\nput 2 2\nget 1\nput 3 3\nget 2\nget 3\nOutput:\n1\n-1\n3',
    testCases: [],
  },
  {
    id: 'add_two_numbers',
    title: 'Add Two Numbers',
    difficulty: 'Medium',
    topic: ['Arrays & Strings', 'Linked List'],
    description:
      'Two numbers as reversed digit arrays. Add them and return result as reversed array.\n\nInput format:\n- Line 1: space-separated digits of num1 (reversed)\n- Line 2: space-separated digits of num2 (reversed)\n\nOutput format:\n- Space-separated result digits (reversed)',
    constraints: ['1 <= digits <= 100'],
    example: 'Input:\n2 4 3\n5 6 4\nOutput:\n7 0 8',
    testCases: [
      { stdin: '2 4 3\n5 6 4\n', expectedOutput: '7 0 8' },
      { stdin: '0\n0\n', expectedOutput: '0' },
      { stdin: '9 9 9 9 9 9 9\n9 9 9 9\n', expectedOutput: '8 9 9 9 0 0 0 1' },
    ],
  },
  {
    id: 'serialize_deserialize_binary_tree',
    title: 'Serialize and Deserialize Binary Tree',
    difficulty: 'Hard',
    topic: ['Trees & Graphs', 'Trees'],
    description:
      'Serialize tree to string, deserialize back. Use level-order with null for missing nodes.\n\nInput format:\n- Level-order: space-separated values, null for empty\n\nOutput format:\n- Same format',
    constraints: ['0 <= nodes <= 10^4'],
    example: 'Input:\n1 2 3 null null 4 5\nOutput:\n1 2 3 null null 4 5',
    testCases: [],
  },
]

export function getProblemById(id) {
  return PROBLEMS.find((p) => p.id === id) || PROBLEMS[0]
}

export function pickProblem({ roomCode, difficulty, interviewType, problemId }) {
  if (problemId) {
    const p = getProblemById(problemId)
    if (p) return p
  }

  const diff = difficulty || 'Easy'
  const type = interviewType || 'Mixed'

  const topicMatch = (p) => {
    if (type === 'Mixed') return true
    if (!p.topic?.length) return false
    return p.topic.includes(type) || p.topic.join(' ').toLowerCase().includes(type.toLowerCase().split(' ')[0])
  }

  const candidates = PROBLEMS.filter((p) => p.difficulty === diff && topicMatch(p))
  const list = candidates.length ? candidates : PROBLEMS.filter((p) => p.difficulty === diff)
  const hash = Array.from(roomCode || '').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const idx = list.length ? hash % list.length : 0
  return list[idx] || PROBLEMS[0]
}
