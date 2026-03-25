import express from 'express'
import axios from 'axios'

const router = express.Router()

const BASE_URL = 'https://judge0-ce.p.rapidapi.com'
const HOST = 'judge0-ce.p.rapidapi.com'

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

router.post('/', async (req, res) => {
  try {
    const apiKey = process.env.JUDGE0_API_KEY
    if (!apiKey) return res.status(500).json({ error: 'JUDGE0_API_KEY is not set' })

    const { code, language_id, stdin, tests } = req.body || {}
    if (typeof code !== 'string') return res.status(400).json({ error: 'code must be a string' })
    if (!language_id) return res.status(400).json({ error: 'language_id is required' })
    if (code.length > 200_000) return res.status(413).json({ error: 'code too large' })
    if (stdin && typeof stdin !== 'string') return res.status(400).json({ error: 'stdin must be a string' })
    if (Array.isArray(tests) && tests.length > 30) return res.status(400).json({ error: 'too many tests' })

    const headers = {
      'Content-Type': 'application/json',
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': HOST,
    }

    async function runSingle({ stdinOverride = '' }) {
      const submit = await axios.post(
        `${BASE_URL}/submissions?base64_encoded=false&wait=false`,
        {
          language_id,
          source_code: code,
          stdin: stdinOverride || '',
        },
        { headers, timeout: 30_000 },
      )

      const token = submit.data?.token
      if (!token) throw new Error('Judge0 did not return a token')

      let attempts = 0
      while (attempts < 25) {
        attempts++
        const poll = await axios.get(
          `${BASE_URL}/submissions/${token}?base64_encoded=false`,
          { headers, timeout: 30_000 },
        )
        const s = poll.data?.status
        const statusId = s?.id
        if (statusId && statusId > 2) {
          const stdout = poll.data?.stdout || ''
          const stderr = poll.data?.stderr || poll.data?.compile_output || ''
          const rawStatus = s?.description || 'Unknown'
          const execution_time = poll.data?.time ? Math.round(Number(poll.data.time) * 1000) : null
          const memory_used = poll.data?.memory ? (Number(poll.data.memory) / 1024).toFixed(1) : null

          return { stdout, stderr, rawStatus, execution_time, memory_used }
        }
        await sleep(400)
      }

      throw new Error('Execution timed out')
    }

    const testList = Array.isArray(tests) ? tests : null
    if (!testList?.length) {
      const out = await runSingle({ stdinOverride: stdin || '' })
      return res.json({
        stdout: out.stdout,
        stderr: out.stderr,
        status: out.rawStatus,
        execution_time: out.execution_time,
        memory_used: out.memory_used,
      })
    }

    const results = []
    for (const t of testList) {
      if (t?.stdin && t.stdin.length > 20_000) return res.status(413).json({ error: 'stdin too large' })
      if (t?.expectedOutput && t.expectedOutput.length > 5_000) {
        return res.status(413).json({ error: 'expectedOutput too large' })
      }
      // eslint-disable-next-line no-await-in-loop
      const out = await runSingle({ stdinOverride: t.stdin || '' })
      const expected = typeof t.expectedOutput === 'string' ? t.expectedOutput : null
      const stdoutTrim = (out.stdout || '').trim()
      const expectedTrim = expected != null ? expected.trim() : null

      let status = out.rawStatus
      let pass = null
      if (expectedTrim != null) {
        pass = stdoutTrim === expectedTrim && !(out.stderr || '').trim()
        status = pass
          ? 'Accepted'
          : /Time Limit Exceeded/i.test(out.rawStatus)
            ? 'Time Limit Exceeded'
            : /Runtime Error/i.test(out.rawStatus) || (out.stderr || '').trim()
              ? 'Runtime Error'
              : 'Wrong Answer'
      } else {
        pass = null
      }

      results.push({
        stdin: t.stdin || '',
        expectedOutput: expected,
        stdout: out.stdout,
        stderr: out.stderr,
        status,
        pass,
        execution_time: out.execution_time,
        memory_used: out.memory_used,
      })
    }

    return res.json({
      tests: results,
      status: results.every((r) => r.pass) ? 'Accepted' : 'Evaluated',
    })
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Execution failed' })
  }
})

export default router

